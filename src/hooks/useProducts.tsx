
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
        
        const fetchedProducts = await productService.getAll();
        
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          
          // Update cache
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
          localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } else {
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
              setProducts(JSON.parse(cachedData));
            } else {
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

  const clearCache = () => {
    localStorage.removeItem(PRODUCTS_CACHE_KEY);
    localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
  };

  const updateCache = (updatedProducts: Product[]) => {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
    localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.create(product);
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      
      // Clear and update cache immediately
      clearCache();
      updateCache(updatedProducts);
      
      // Dispatch event for immediate synchronization
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: 'add', 
          productId: newProduct.id,
          product: newProduct 
        } 
      }));
      
      toast({
        title: 'Produto adicionado',
        description: 'Produto adicionado com sucesso!',
      });
      
      return newProduct.id;
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
      
      const updatedProducts = products.map((item) => 
        item.id === id ? { ...item, ...product } : item
      );
      setProducts(updatedProducts);
      
      // Clear and update cache immediately
      clearCache();
      updateCache(updatedProducts);
      
      // Dispatch event for immediate synchronization
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: 'update', 
          productId: id,
          updatedData: product 
        } 
      }));
      
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

  const forceRefreshProducts = async () => {
    setIsLoading(true);
    
    try {
      clearCache();
      setHasAttemptedLoad(false);
      
      const fetchedProducts = await productService.getAll();
      
      if (fetchedProducts && fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
        updateCache(fetchedProducts);
      } else {
        setProducts([]);
      }
      
      // Dispatch event for immediate synchronization
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: 'refresh',
          products: fetchedProducts 
        } 
      }));
      
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
    syncPendingProducts,
    forceRefreshProducts
  };
};

// Export fetchProducts function for compatibility
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    return await productService.getAll();
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};
