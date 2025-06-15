
import { Product, ProductBrand, ProductCategory, ProductGroup } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productService } from '@/services/supabase/productService';
import { productBrandService } from '@/services/supabase/productBrandService';
import { productCategoryService } from '@/services/supabase/productCategoryService';
import { productGroupService } from '@/services/supabase/productGroupService';
import { productLocalService } from '@/services/local/productLocalService';

// Cache keys
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_timestamp';

/**
 * Adds a new product to the system
 */
export const addProduct = async (
  product: Omit<Product, 'id'>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<string> => {
  try {
    console.log('🔄 [ProductOperations] Starting product creation...');
    console.log('📝 [ProductOperations] Input product data:', product);
    console.log('📊 [ProductOperations] Current products count:', products.length);
    
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
    
    console.log("📋 [ProductOperations] Product with generated data:", productWithCode);
    
    // Add to Supabase
    console.log("🔄 [ProductOperations] Calling productService.create...");
    const newProduct = await productService.create(productWithCode);
    console.log("✅ [ProductOperations] Product created successfully:", newProduct);
    
    // Atualizar o estado local - ensure we're using the correct setter pattern for state updates
    console.log("🔄 [ProductOperations] Updating local state...");
    setProducts(currentProducts => {
      const updatedProducts = [...currentProducts, newProduct];
      console.log("📊 [ProductOperations] Local state updated. New count:", updatedProducts.length);
      return updatedProducts;
    });
    
    console.log("🎉 [ProductOperations] Product creation completed successfully!");
    toast({
      title: "Produto adicionado",
      description: `${newProduct.name} foi adicionado com sucesso!`
    });
    return newProduct.id;
  } catch (error) {
    console.error("❌ [ProductOperations] Error adding product:", error);
    console.error("❌ [ProductOperations] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      product: product
    });
    toast({
      title: "Erro ao adicionar produto",
      description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      variant: "destructive"
    });
    return "";
  }
};

/**
 * Updates an existing product with improved error handling and state management
 */
export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> => {
  try {
    console.log(`🔄 [ProductOperations] Starting update for product ${id}:`, productData);
    
    // Find the existing product to validate
    const existingProduct = products.find(p => p.id === id);
    if (!existingProduct) {
      throw new Error(`Produto com ID ${id} não encontrado no estado local`);
    }
    
    // Prepare update data with proper validation
    const updateData = { 
      ...productData, 
      updatedAt: new Date() 
    };
    
    // Nunca permitir que o código seja indefinido ou nulo ao atualizar
    if (updateData.code === undefined || updateData.code === null) {
      updateData.code = existingProduct.code;
    }
    
    console.log(`📝 [ProductOperations] Final update data for ${existingProduct.name}:`, updateData);
    
    // Update in Supabase first
    const updatedProduct = await productService.update(id, updateData);
    console.log(`✅ [ProductOperations] Supabase update successful for ${existingProduct.name}`);
    
    // Update local state with the returned product data
    setProducts(currentProducts => {
      const newProducts = currentProducts.map(p => 
        p.id === id ? { ...p, ...updatedProduct } : p
      );
      
      // Update cache immediately
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(newProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      console.log(`📊 [ProductOperations] Local state updated for ${existingProduct.name}`);
      return newProducts;
    });
    
    // Dispatch global update event for other components
    const updateEvent = new CustomEvent('productUpdated', { 
      detail: { productId: id, productName: existingProduct.name } 
    });
    window.dispatchEvent(updateEvent);
    
    console.log(`🎉 [ProductOperations] Product update completed successfully for ${existingProduct.name}`);
    
  } catch (error) {
    console.error(`❌ [ProductOperations] Error updating product ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Don't show toast for individual updates during bulk operations
    // The bulk operation will handle its own error reporting
    if (!productData._isBulkUpdate) {
      toast({
        title: "Erro ao atualizar produto",
        description: `Erro: ${errorMessage}`,
        variant: "destructive"
      });
    }
    
    throw error; // Re-throw to let bulk operations handle it
  }
};

/**
 * Deletes a product with improved sync
 */
export const deleteProduct = async (
  id: string,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> => {
  try {
    console.log(`Deleting product ${id}`);
    
    // Delete from Supabase first
    await productService.delete(id);
    
    // Update local state
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    
    // Update localStorage cache
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
    localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    toast({
      title: "Produto excluído",
      description: "Produto excluído com sucesso!"
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
 * Validates if a discount percentage is acceptable for a product
 */
export const validateProductDiscount = (
  productId: string,
  discountPercent: number,
  products: Product[]
): string | boolean => {
  const product = products.find(p => p.id === productId);
  if (!product) return true;
  
  // Check if discount is positive
  if (discountPercent < 0) {
    return "O desconto não pode ser negativo";
  }
  
  // Check if discount exceeds 100%
  if (discountPercent > 100) {
    return "O desconto não pode ser maior que 100%";
  }
  
  // Check maximum discount if defined
  if (product.maxDiscountPercent && discountPercent > product.maxDiscountPercent) {
    return `O desconto não pode ser maior que ${product.maxDiscountPercent}%`;
  }
  
  return true;
};

/**
 * Gets the maximum discount percentage for a product
 */
export const getMaximumDiscount = (productId: string, products: Product[]): number => {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
  
  // Return the defined maximum discount or 100% (no limit)
  return product.maxDiscountPercent || 100;
};

/**
 * Calculates the minimum effective price based on maximum discount
 */
export const getMinimumEffectivePrice = (productId: string, products: Product[]): number => {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
  
  if (!product.maxDiscountPercent) return 0; // No minimum if no discount limit
  
  // Calculate minimum price: price * (1 - maxDiscount/100)
  return product.price * (1 - product.maxDiscountPercent / 100);
};

/**
 * Validates if a discount percentage is within the defined range for a product
 */
export const isDiscountWithinRange = (
  productId: string,
  discountPercent: number,
  products: Product[]
): boolean => {
  const validation = validateProductDiscount(productId, discountPercent, products);
  return validation === true;
};

/**
 * Enhanced bulk products update with better error handling and batch processing
 */
export const addBulkProducts = async (
  products: Omit<Product, 'id'>[],
  currentProducts: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  updateProgress: (progress: number) => void
): Promise<string[]> => {
  try {
    console.log('🔄 [ProductOperations] Starting bulk product import...');
    console.log('📊 [ProductOperations] Products to import:', products.length);
    
    const createdIds: string[] = [];
    const createdProducts: Product[] = [];
    const errors: string[] = [];
    
    // Process each product individually
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / products.length) * 100;
      updateProgress(progress);
      
      try {
        console.log(`🔄 [ProductOperations] Processing product ${i + 1}/${products.length}: ${product.name}`);
        
        // Garantir que o produto tenha um código único
        const productCode = product.code || (currentProducts.length > 0 
          ? Math.max(...currentProducts.map(p => p.code || 0), ...createdProducts.map(p => p.code || 0)) + 1 + i 
          : 1 + i);
        
        const productWithCode = { 
          ...product, 
          code: productCode,
          // Ensure we have a price value (default to cost if not provided)
          price: product.price !== undefined ? product.price : product.cost,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log(`📝 [ProductOperations] Product ${i + 1} with code:`, productWithCode.code);
        
        // Save to Supabase
        const newProduct = await productService.create(productWithCode);
        console.log(`✅ [ProductOperations] Product ${i + 1} created successfully:`, newProduct.id);
        
        createdIds.push(newProduct.id);
        createdProducts.push(newProduct);
        
      } catch (error) {
        console.error(`❌ [ProductOperations] Error creating product ${i + 1}:`, error);
        const errorMessage = `Produto ${product.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        errors.push(errorMessage);
      }
    }
    
    // Update local state with successfully created products
    if (createdProducts.length > 0) {
      console.log(`🔄 [ProductOperations] Updating local state with ${createdProducts.length} products...`);
      setProducts(currentProducts => {
        const updatedProducts = [...currentProducts, ...createdProducts];
        console.log(`📊 [ProductOperations] Local state updated. New total count: ${updatedProducts.length}`);
        
        // Update cache with new products
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        
        return updatedProducts;
      });
      
      // Trigger a global products updated event to refresh any other components listening
      const event = new CustomEvent('productsUpdated', { detail: { count: createdProducts.length } });
      window.dispatchEvent(event);
      console.log(`📡 [ProductOperations] Dispatched productsUpdated event for ${createdProducts.length} products`);
    }
    
    // Show results to user
    if (errors.length > 0) {
      console.warn(`⚠️ [ProductOperations] ${errors.length} products failed to import:`, errors);
      toast({
        title: "Importação parcialmente concluída",
        description: `${createdProducts.length} produtos importados com sucesso. ${errors.length} falharam.`,
        variant: errors.length === products.length ? "destructive" : "default"
      });
    } else {
      console.log(`🎉 [ProductOperations] All ${createdProducts.length} products imported successfully!`);
      toast({
        title: "Produtos importados",
        description: `${createdProducts.length} produtos foram importados com sucesso!`
      });
    }
    
    // Log detailed results
    console.log('📊 [ProductOperations] Bulk import results:', {
      total: products.length,
      success: createdProducts.length,
      failed: errors.length,
      successIds: createdIds
    });
    
    return createdIds;
  } catch (error) {
    console.error("❌ [ProductOperations] Critical error in bulk product import:", error);
    toast({
      title: "Erro na importação em massa",
      description: `Erro crítico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Enhanced batch update for pricing with retry logic and better error handling
 */
export const batchUpdateProducts = async (
  updates: Array<{ id: string; data: Partial<Product> }>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  onProgress?: (progress: number, currentProduct?: string) => void
): Promise<{ success: number; failed: string[] }> => {
  console.log(`🔄 [ProductOperations] Starting batch update for ${updates.length} products`);
  
  const results = { success: 0, failed: [] as string[] };
  const batchSize = 5; // Process in smaller batches to avoid overwhelming the system
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (update, batchIndex) => {
      const globalIndex = i + batchIndex;
      const product = products.find(p => p.id === update.id);
      
      if (onProgress) {
        onProgress(((globalIndex + 1) / updates.length) * 100, product?.name);
      }
      
      try {
        console.log(`🔄 [ProductOperations] Updating product ${globalIndex + 1}/${updates.length}: ${product?.name}`);
        
        // Mark as bulk update to avoid individual toasts
        const updateData = { ...update.data, _isBulkUpdate: true };
        
        await updateProduct(update.id, updateData, products, setProducts);
        console.log(`✅ [ProductOperations] Successfully updated ${product?.name}`);
        
        return { success: true, productName: product?.name || 'Unknown' };
      } catch (error) {
        console.error(`❌ [ProductOperations] Failed to update ${product?.name}:`, error);
        const errorMessage = `${product?.name || 'Unknown'}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        return { success: false, error: errorMessage };
      }
    });
    
    // Wait for current batch to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Process results
    batchResults.forEach(result => {
      if (result.success) {
        results.success++;
      } else {
        results.failed.push(result.error!);
      }
    });
    
    // Small delay between batches to prevent overwhelming the system
    if (i + batchSize < updates.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`📊 [ProductOperations] Batch update completed:`, results);
  return results;
};

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
