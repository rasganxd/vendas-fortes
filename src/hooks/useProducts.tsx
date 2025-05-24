
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/supabase/productService';
import { toast } from '@/components/ui/use-toast';

// Cache keys
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    if (hasAttemptedLoad) return;
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log("Fetching products from Supabase");
        const fetchedProducts = await productService.getAll();
        console.log(`Loaded ${fetchedProducts.length} products from Supabase`);
        
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          console.log("Updated products state with Supabase data");
          
          // Update cache
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
          localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } else {
          console.log("No products found in Supabase");
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Try to use cached data as fallback
        try {
          const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
          
          if (cachedData && cachedTimestamp) {
            const age = Date.now() - parseInt(cachedTimestamp);
            if (age < CACHE_MAX_AGE) {
              console.log("Using cached products data");
              setProducts(JSON.parse(cachedData));
            } else {
              console.log("Cached products data is too old");
              setProducts([]);
            }
          } else {
            setProducts([]);
          }
        } catch (cacheError) {
          console.error('Error loading cached products:', cacheError);
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [hasAttemptedLoad]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const id = await productService.add(product);
      
      const newProduct = { ...product, id } as Product;
      setProducts((prev) => [...prev, newProduct]);
      
      // Update cache
      const updatedProducts = [...products, newProduct];
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Produto adicionado',
        description: 'Produto adicionado com sucesso!',
      });
      
      return id;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o produto.',
        variant: 'destructive',
      });
      return "";
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await productService.update(id, product);
      
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...product } : item))
      );
      
      // Update cache
      const updatedProducts = products.map((item) => 
        item.id === id ? { ...item, ...product } : item
      );
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Produto atualizado',
        description: 'Produto atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o produto.',
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log(`Deleting product ${id}`);
      
      // Delete from Supabase first
      await productService.delete(id);
      
      // Update local state
      setProducts((prev) => prev.filter((item) => item.id !== id));
      
      // Update cache
      const updatedProducts = products.filter((item) => item.id !== id);
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Produto excluído',
        description: 'Produto excluído com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
    }
  };

  const forceRefreshProducts = async () => {
    console.log("Force refreshing products from Supabase");
    setIsLoading(true);
    
    try {
      // Clear cache
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      // Clear local state
      setHasAttemptedLoad(false);
      
      // Fetch from Supabase
      const fetchedProducts = await productService.getAll();
      console.log(`Forcefully loaded ${fetchedProducts.length} products from Supabase`);
      
      if (fetchedProducts && fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
        
        // Update cache
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } else {
        console.log("No products found in Supabase during force refresh");
        setProducts([]);
      }
      
      toast({
        title: 'Produtos atualizados',
        description: `${fetchedProducts.length} produtos carregados com sucesso!`,
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error during force refresh of products:', error);
      setIsLoading(false);
      
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os produtos.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  const syncPendingProducts = async () => {
    setIsSyncing(true);
    try {
      // For now, just refresh products since we're using Supabase directly
      const result = await forceRefreshProducts();
      setIsSyncing(false);
      return result;
    } catch (error) {
      console.error('Error syncing products:', error);
      setIsSyncing(false);
      return false;
    }
  };

  return {
    products,
    isLoading,
    isSyncing,
    addProduct,
    updateProduct,
    deleteProduct,
    syncPendingProducts,
    forceRefreshProducts
  };
};

// Export fetchProducts function for compatibility
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching products from Supabase (fetchProducts function)");
    return await productService.getAll();
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};
