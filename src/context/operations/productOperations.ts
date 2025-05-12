
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productService } from '@/services/supabaseService';
import { createBulkProducts } from '@/services/supabase/productService';
import { prepareForSupabase } from '@/utils/dataTransformers';

/**
 * Adds a new product to the database
 */
export const addProduct = async (
  product: Omit<Product, 'id'>, 
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    // Garantir que o produto tenha um código
    const productCode = product.code || (products.length > 0 
      ? Math.max(...products.map(p => p.code || 0)) + 1 
      : 1);
    
    const productWithCode = { 
      ...product, 
      code: productCode,
      // Ensure we have a price value (default to cost if not provided)
      price: product.price !== undefined ? product.price : product.cost
    };
    
    console.log("Product data before preparation:", productWithCode);
    
    // Preparar dados para o formato do Supabase
    const supabaseData = prepareForSupabase(productWithCode);
    console.log("Sending product to Supabase:", supabaseData);
    
    // Adicionar ao Supabase usando o serviço
    const id = await productService.add(supabaseData);
    console.log("Product added with ID:", id);
    
    if (!id) {
      throw new Error("Failed to get product ID from Supabase");
    }
    
    const newProduct = { ...productWithCode, id };
    console.log("New product with ID:", newProduct);
    
    // Atualizar o estado local - ensure we're using the correct setter pattern for state updates
    setProducts(currentProducts => [...currentProducts, newProduct]);
    
    toast({
      title: "Produto adicionado",
      description: "Produto adicionado com sucesso!"
    });
    return id;
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
  product: Partial<Product>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    // Nunca permitir que o código seja indefinido ou nulo ao atualizar
    const updateData = { ...product };
    if (updateData.code === undefined || updateData.code === null) {
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct && existingProduct.code) {
        updateData.code = existingProduct.code;
      }
    }
    
    // Atualizar no Supabase
    await productService.update(id, updateData);
    console.log("Product updated in Supabase, ID:", id, "Data:", updateData);
    
    // Atualizar o estado local usando a função de atualização correta
    setProducts(currentProducts => 
      currentProducts.map(p => p.id === id ? { ...p, ...updateData } : p)
    );
    
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
 * Deletes a product from the database
 */
export const deleteProduct = async (
  id: string,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    // Excluir do Supabase
    await productService.delete(id);
    // Atualizar o estado local
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Produto excluído",
      description: "Produto excluído com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    toast({
      title: "Erro ao excluir produto",
      description: "Houve um problema ao excluir o produto.",
      variant: "destructive"
    });
  }
};

/**
 * Validates if the discounted price respects the maximum discount percentage
 */
export const validateProductDiscount = (
  productId: string, 
  discountedPrice: number,
  products: Product[]
): boolean => {
  const product = products.find(p => p.id === productId);
  if (!product) return true;
  
  if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) return true;
  if (product.price <= 0) return false;
  
  const discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
  return parseFloat(discountPercentage.toFixed(2)) <= parseFloat(product.maxDiscountPercentage.toFixed(2));
};

/**
 * Gets the minimum price for a product based on its maximum discount percentage
 */
export const getMinimumPrice = (productId: string, products: Product[]): number => {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
  
  if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) {
    return 0;
  }
  
  const minimumPrice = product.price * (1 - (product.maxDiscountPercentage / 100));
  return parseFloat(minimumPrice.toFixed(2));
};

/**
 * Adds multiple products at once
 */
export const addBulkProducts = async (
  productsArray: Omit<Product, 'id'>[],
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setIsUsingMockData: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    // Preparar dados para o Supabase
    const supabaseData = productsArray.map(product => {
      // Garantir que o produto tenha um código
      const productCode = product.code || (products.length > 0 
        ? Math.max(...products.map(p => p.code || 0)) + 1 
        : 1);
      return { ...product, code: productCode };
    });
    
    let ids: string[] = [];
    
    // Adicionar ao Supabase
    try {
      ids = await createBulkProducts(supabaseData);
      console.log("Products added to Supabase with IDs:", ids);
    } catch (error) {
      console.error("Failed to add products to Supabase:", error);
      
      // Se falhar no Supabase, gerar IDs locais
      ids = supabaseData.map(() => `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
      setIsUsingMockData(true);
      
      // Armazenar dados mock atualizados no localStorage
      const newMockProducts = supabaseData.map((product, index) => ({
        ...product,
        id: ids[index]
      }));
      const mockProducts = JSON.parse(localStorage.getItem('mockProducts') || '[]');
      const updatedMockProducts = [...mockProducts, ...newMockProducts];
      localStorage.setItem('mockProducts', JSON.stringify(updatedMockProducts));
    }
    
    // Criar produtos completos com IDs
    const newProducts = supabaseData.map((product, index) => ({
      ...product,
      id: ids[index]
    })) as Product[];
    
    console.log("New products to add to state:", newProducts);
    
    // Atualizar estado local usando a função de atualização correta
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
