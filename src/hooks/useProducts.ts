import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/supabase/productService';
import { toast } from '@/components/ui/use-toast';

// Reduced cache time for faster updates
const CACHE_MAX_AGE = 2 * 60 * 1000; // 2 minutes instead of 5
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_timestamp';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Force refresh function
  const forceRefreshProducts = async () => {
    console.log("Force refreshing products from Supabase");
    setIsLoading(true);
    
    try {
      // Clear cache
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      // Fetch from Supabase
      const fetchedProducts = await productService.getAll();
      console.log(`Forcefully loaded ${fetchedProducts.length} products from Supabase`);
      
      setProducts(fetchedProducts);
      
      // Update cache
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Produtos atualizados',
        description: `${fetchedProducts.length} produtos carregados com sucesso!`,
      });
      
      return true;
    } catch (error) {
      console.error('Error during force refresh of products:', error);
      
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os produtos.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load products with improved caching
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < CACHE_MAX_AGE) {
          console.log("Using cached products data");
          setProducts(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
      }
      
      console.log("Fetching products from Supabase");
      const fetchedProducts = await productService.getAll();
      console.log(`Loaded ${fetchedProducts.length} products from Supabase`);
      
      setProducts(fetchedProducts);
      
      // Update cache
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Try to use cached data as fallback
      const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cachedData) {
        console.log("Using cached products data as fallback");
        setProducts(JSON.parse(cachedData));
      } else {
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for product updates from other components
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log("Products updated event received, refreshing...");
      forceRefreshProducts();
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.create(product);
      
      // Update local state immediately
      setProducts((prev) => [...prev, newProduct]);
      
      // Update cache
      const updatedProducts = [...products, newProduct];
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
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
      
      // Update local state immediately
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...product, updatedAt: new Date() } : item))
      );
      
      // Update cache
      const updatedProducts = products.map((item) => 
        item.id === id ? { ...item, ...product, updatedAt: new Date() } : item
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
      console.log(`🗑️ Deleting product ${id}`);
      
      // Delete from Supabase first - Note: this now uses the simple delete
      // Enhanced deletion with dependencies is handled at the page level
      await productService.delete(id);
      
      // Update local state immediately
      setProducts((prev) => prev.filter((item) => item.id !== id));
      
      // Update cache
      const updatedProducts = products.filter((item) => item.id !== id);
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      console.log("✅ Product deleted successfully from local state and cache");
      
      toast({
        title: 'Produto excluído',
        description: 'Produto excluído com sucesso!',
      });
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      
      // Enhanced error handling
      let errorMessage = 'Não foi possível excluir o produto.';
      
      if (error.message?.includes('foreign key')) {
        errorMessage = 'Produto não pode ser excluído pois está sendo usado em outros registros.';
      } else if (error.message?.includes('dependências')) {
        errorMessage = 'Produto possui dependências que impedem a exclusão.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Re-throw to let the caller handle it
      throw error;
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
    deleteProduct,
    setProducts,
    syncPendingProducts,
    forceRefreshProducts
  };
};

// Export function for backward compatibility
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    return await productService.getAll();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};
