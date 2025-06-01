
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productService } from '@/services/supabase/productService';
import { productDiscountService } from '@/services/supabase/productDiscountService';
import { productBrandService } from '@/services/supabase/productBrandService';
import { productCategoryService } from '@/services/supabase/productCategoryService';
import { productGroupService } from '@/services/supabase/productGroupService';
import { productLocalService } from '@/services/local/productLocalService';

// Cache keys
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_timestamp';

// Cache for discount settings
let discountSettingsCache: Record<string, number> = {};
let discountCacheTimestamp = 0;
const DISCOUNT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Adds a new product to the system
 */
export const addProduct = async (
  product: Omit<Product, 'id'>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<string> => {
  try {
    // Garantir que o produto tenha um código
    const productCode = product.code || (products.length > 0 
      ? Math.max(...products.map(p => p.code || 0)) + 1 
      : 1);
    
    const productWithCode = { 
      ...product, 
      code: productCode,
      // Ensure we have a price value (default to cost if not provided)
      price: product.price !== undefined ? product.price : product.cost,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to Supabase
    const newProduct = await productService.create(productWithCode);
    
    // Atualizar o estado local - ensure we're using the correct setter pattern for state updates
    setProducts(currentProducts => [...currentProducts, newProduct]);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('productsUpdated', {
      detail: { action: 'add', product: newProduct }
    }));
    
    toast({
      title: "Produto adicionado",
      description: "Produto adicionado com sucesso!"
    });
    return newProduct.id;
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    toast({
      title: "Erro ao adicionar produto",
      description: "Houve um problema ao adicionar o produto.",
      variant: "destructive"
    });
    return "";
  }
};

/**
 * Updates an existing product
 */
export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> => {
  try {
    // Nunca permitir que o código seja indefinido ou nulo ao atualizar
    const updateData = { ...productData, updatedAt: new Date() };
    if (updateData.code === undefined || updateData.code === null) {
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct && existingProduct.code) {
        updateData.code = existingProduct.code;
      }
    }
    
    // Update in Supabase
    await productService.update(id, updateData);
    
    // Atualizar o estado local usando a função de atualização correta
    setProducts(currentProducts => 
      currentProducts.map(p => p.id === id ? { ...p, ...updateData } : p)
    );
    
    // Dispatch events to notify other components about the update
    window.dispatchEvent(new CustomEvent('productsUpdated', {
      detail: { action: 'update', productId: id, product: updateData }
    }));
    
    // If price was updated, dispatch specific price update event
    if (updateData.price !== undefined) {
      window.dispatchEvent(new CustomEvent('productPriceUpdated', {
        detail: { productId: id, newPrice: updateData.price }
      }));
    }
    
    toast({
      title: "Produto atualizado",
      description: "Produto atualizado com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    toast({
      title: "Erro ao atualizar produto",
      description: "Houve um problema ao atualizar o produto.",
      variant: "destructive"
    });
  }
};

/**
 * Deletes a product with automatic cleanup of units and pricing
 */
export const deleteProduct = async (
  id: string,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> => {
  try {
    // Use the simple delete method that automatically removes units and pricing
    await productService.delete(id);
    
    // Update local state
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    
    // Update localStorage cache
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
    localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    // Clear from discount cache
    delete discountSettingsCache[id];
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('productsUpdated', {
      detail: { action: 'delete', productId: id }
    }));
    
    toast({
      title: "Produto excluído",
      description: "Produto excluído com sucesso! Unidades e configurações removidas automaticamente."
    });
    
    return;
  } catch (error) {
    console.error("Error deleting product:", error);
    toast({
      title: "Erro ao excluir produto",
      description: "Houve um problema ao excluir o produto.",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Load discount settings cache
 */
const loadDiscountSettingsCache = async (): Promise<void> => {
  const now = Date.now();
  
  // Check if cache is still valid
  if (now - discountCacheTimestamp < DISCOUNT_CACHE_DURATION && Object.keys(discountSettingsCache).length > 0) {
    return;
  }
  
  try {
    console.log("🔄 Loading discount settings cache");
    discountSettingsCache = await productDiscountService.getAllDiscounts();
    discountCacheTimestamp = now;
    console.log("✅ Discount settings cache loaded:", Object.keys(discountSettingsCache).length, "products");
  } catch (error) {
    console.error("❌ Error loading discount settings cache:", error);
    discountSettingsCache = {};
  }
};

/**
 * Gets the maximum discount percentage for a product
 */
export const getMaximumDiscountPercentage = async (productId: string, products: Product[]): Promise<number> => {
  try {
    // Load cache if needed
    await loadDiscountSettingsCache();
    
    // Check cache first
    if (discountSettingsCache[productId] !== undefined) {
      console.log(`💰 Discount from cache for product ${productId}: ${discountSettingsCache[productId]}%`);
      return discountSettingsCache[productId];
    }
    
    // If not in cache, try to get from service
    const discountSetting = await productDiscountService.getByProductId(productId);
    
    if (discountSetting && discountSetting.maxDiscountPercentage !== null) {
      const percentage = discountSetting.maxDiscountPercentage;
      // Update cache
      discountSettingsCache[productId] = percentage;
      console.log(`💰 Discount from database for product ${productId}: ${percentage}%`);
      return percentage;
    }
    
    console.log(`💰 No discount setting found for product ${productId}, defaulting to 0%`);
    return 0;
  } catch (error) {
    console.error("Error getting maximum discount percentage:", error);
    return 0;
  }
};

/**
 * Validates if a discounted price is acceptable for a product using percentage-based discount
 */
export const validateProductDiscount = async (
  productId: string, 
  discountedPrice: number, 
  products: Product[]
): Promise<string | boolean> => {
  const product = products.find(p => p.id === productId);
  if (!product) return "Produto não encontrado";
  
  // Check if price is positive
  if (discountedPrice <= 0) {
    return "O preço com desconto deve ser maior que zero";
  }
  
  // Get maximum discount percentage from service
  const maxDiscountPercentage = await getMaximumDiscountPercentage(productId, products);
  
  // If no limit is set, allow any positive price
  if (maxDiscountPercentage === 0) {
    return true;
  }
  
  // Calculate current discount percentage
  const currentDiscountPercentage = ((product.price - discountedPrice) / product.price) * 100;
  
  // Check if discount exceeds maximum allowed
  if (currentDiscountPercentage > maxDiscountPercentage) {
    return `Desconto de ${currentDiscountPercentage.toFixed(1)}% excede o limite máximo de ${maxDiscountPercentage.toFixed(1)}%`;
  }
  
  return true;
};

/**
 * Gets the minimum price for a product based on maximum discount percentage
 */
export const getMinimumPrice = async (productId: string, products: Product[]): Promise<number> => {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
  
  // Get maximum discount percentage
  const maxDiscountPercentage = await getMaximumDiscountPercentage(productId, products);
  
  // If no discount limit, return cost as minimum
  if (maxDiscountPercentage === 0) {
    return product.cost || 0;
  }
  
  // Calculate minimum price based on maximum discount
  const minPrice = product.price * (1 - maxDiscountPercentage / 100);
  return Math.max(minPrice, product.cost || 0);
};

/**
 * Gets the current discount percentage for a given price
 */
export const getCurrentDiscountPercentage = (
  productId: string,
  currentPrice: number,
  products: Product[]
): number => {
  const product = products.find(p => p.id === productId);
  if (!product || product.price <= 0) return 0;
  
  const discountPercentage = ((product.price - currentPrice) / product.price) * 100;
  return Math.max(0, discountPercentage);
};

/**
 * Validates if a price is within the defined discount range for a product
 */
export const isPriceWithinRange = async (
  productId: string,
  price: number,
  products: Product[]
): Promise<boolean> => {
  const validation = await validateProductDiscount(productId, price, products);
  return validation === true;
};

/**
 * Gets the maximum price for a product
 */
export const getMaximumPrice = (productId: string, products: Product[]): number => {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
  
  // Return the defined maximum price or 0 (no limit)
  return product.maxPrice || 0;
};

/**
 * Adds multiple products at once
 */
export const addBulkProducts = async (
  products: Omit<Product, 'id'>[],
  currentProducts: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  updateProgress: (progress: number) => void
): Promise<string[]> => {
  try {
    // Preparar dados para armazenamento local
    const productsWithData = products.map(product => {
      // Garantir que o produto tenha um código
      const productCode = product.code || (currentProducts.length > 0 
        ? Math.max(...currentProducts.map(p => p.code || 0)) + 1 
        : 1);
      return { 
        ...product, 
        code: productCode,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    // Add to local storage
    console.log("Adding bulk products:", productsWithData);
    const ids = await productLocalService.createBulk(productsWithData);
    console.log("Products added with IDs:", ids);
    
    // Create products with IDs
    const newProducts = productsWithData.map((product, index) => ({
      ...product,
      id: ids[index]
    }));
    
    // Update state
    setProducts(currentProducts => [...currentProducts, ...newProducts]);
    
    toast({
      title: "Produtos adicionados",
      description: `${newProducts.length} produtos foram adicionados com sucesso!`
    });
    
    return ids;
  } catch (error) {
    console.error("Erro ao adicionar produtos em massa:", error);
    toast({
      title: "Erro ao adicionar produtos",
      description: "Houve um problema ao adicionar os produtos em massa.",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Syncs products with Supabase
 */
export const syncProductsWithSupabase = async (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    console.log("Syncing products with Supabase...");
    setIsLoading(true);
    
    // Get products from Supabase
    const supabaseProducts = await productService.getAll();
    console.log(`Retrieved ${supabaseProducts.length} products from Supabase`);
    
    setProducts(supabaseProducts);
    
    toast({
      title: "Produtos sincronizados",
      description: `${supabaseProducts.length} produtos sincronizados com sucesso.`
    });
  } catch (error) {
    console.error('Error syncing products with Supabase:', error);
    toast({
      title: "Erro na sincronização",
      description: "Não foi possível sincronizar os produtos.",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};
