import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService, createBulkProducts } from '@/services/supabase';
import { toast } from '@/components/ui/use-toast';
import { transformProductData, transformArray, prepareForSupabase } from '@/utils/dataTransformers';

export const loadProducts = async (): Promise<Product[]> => {
  try {
    console.log("Loading products from Supabase");
    const data = await productService.getAll();
    const transformedProducts = transformArray(data, transformProductData) as Product[];
    console.log(`Loaded ${transformedProducts.length} products from Supabase`);
    return transformedProducts;
  } catch (error) {
    console.error("Error loading products:", error);
    // Return an empty array as fallback
    return [];
  }
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const loadedProducts = await loadProducts();
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Convert product to snake_case format for Supabase
      const supabaseData = prepareForSupabase(product);
      
      const id = await productService.add(supabaseData);
      const newProduct = { ...product, id } as Product;
      
      setProducts(prev => [...prev, newProduct]);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Houve um problema ao adicionar o produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      // Convert product to snake_case format for Supabase
      const supabaseData = prepareForSupabase(product);
      
      await productService.update(id, supabaseData);
      
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...product } : p
      ));
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Houve um problema ao atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };

  const validateProductDiscount = (productId: string, discountedPrice: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return true;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) return true;
    if (product.price <= 0) return false;
    
    const discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
    return parseFloat(discountPercentage.toFixed(2)) <= parseFloat(product.maxDiscountPercentage.toFixed(2));
  };

  const getMinimumPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) {
      return 0;
    }
    
    const minimumPrice = product.price * (1 - (product.maxDiscountPercentage / 100));
    return parseFloat(minimumPrice.toFixed(2));
  };

  // Calculate profit margin
  const calculateProfitMargin = (price: number, cost: number): number => {
    if (!price || !cost || cost === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  // Calculate minimum price based on discount
  const calculateMinimumPrice = (price: number, maxDiscount: number): number => {
    if (!price || maxDiscount === undefined || maxDiscount === null) return 0;
    return price * (1 - (maxDiscount / 100));
  };
  
  const addBulkProducts = async (products: Omit<Product, 'id'>[]) => {
    try {
      // Converter produtos para formato do Supabase (snake_case)
      const supabaseData = products.map(product => prepareForSupabase(product));
      
      // Adicionar em lote ao Supabase
      const ids = await createBulkProducts(supabaseData);
      
      // Criar produtos completos com IDs
      const newProducts = products.map((product, index) => ({
        ...product,
        id: ids[index]
      })) as Product[];
      
      // Atualizar estado local
      setProducts(prev => [...prev, ...newProducts]);
      
      return ids;
    } catch (error) {
      console.error("Error adding bulk products:", error);
      toast({
        title: "Erro ao adicionar produtos em lote",
        description: "Houve um problema ao adicionar os produtos.",
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    setProducts,
    validateProductDiscount,
    getMinimumPrice,
    calculateProfitMargin,
    calculateMinimumPrice,
    addBulkProducts, // Adicionando nova função
  };
};
