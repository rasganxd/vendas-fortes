
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/supabase/productService';
import { toast } from '@/components/ui/use-toast';

// Reduced cache time for faster updates
const CACHE_MAX_AGE = 2 * 60 * 1000; // 2 minutes
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_timestamp';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load products with improved caching and debugging
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 [useProducts] Starting to load products...");
      
      // Check cache first
      const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < CACHE_MAX_AGE) {
          console.log("💾 [useProducts] Using cached products data");
          const cachedProducts = JSON.parse(cachedData);
          console.log("📊 [useProducts] Cached products count:", cachedProducts.length);
          setProducts(cachedProducts);
          setIsLoading(false);
          
          // Log first cached product for debugging
          if (cachedProducts.length > 0) {
            console.log("📦 [useProducts] First cached product:", cachedProducts[0]);
          }
          return;
        } else {
          console.log("⏰ [useProducts] Cache expired, fetching fresh data");
        }
      }
      
      console.log("🌐 [useProducts] Fetching products from Supabase...");
      const fetchedProducts = await productService.getAll();
      console.log("✅ [useProducts] Raw data from service:", fetchedProducts);
      console.log("📊 [useProducts] Loaded", fetchedProducts?.length || 0, "products from Supabase");
      
      if (fetchedProducts && Array.isArray(fetchedProducts)) {
        console.log("🔄 [useProducts] Setting products state...");
        console.log("🎯 [useProducts] Setting products state with", fetchedProducts.length, "items");
        
        // Log detailed info about first product
        if (fetchedProducts.length > 0) {
          console.log("📦 [useProducts] First product detailed info:", {
            id: fetchedProducts[0].id,
            name: fetchedProducts[0].name,
            code: fetchedProducts[0].code,
            cost: fetchedProducts[0].cost,
            price: fetchedProducts[0].price,
            stock: fetchedProducts[0].stock
          });
        }
        
        setProducts(fetchedProducts);
        
        // Update cache
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        
        console.log("✅ [useProducts] Products state updated successfully");
      } else {
        console.warn("⚠️ [useProducts] Invalid data format received:", typeof fetchedProducts);
        setProducts([]);
      }
      
    } catch (error) {
      console.error('❌ [useProducts] Error fetching products:', error);
      console.error('❌ [useProducts] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Try to use cached data as fallback
      const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cachedData) {
        console.log("💾 [useProducts] Using cached products data as fallback");
        const fallbackProducts = JSON.parse(cachedData);
        setProducts(fallbackProducts);
        console.log("📊 [useProducts] Fallback products loaded:", fallbackProducts.length);
      } else {
        console.log("📋 [useProducts] No cached data available, setting empty array");
        setProducts([]);
      }
      
      toast({
        title: "Erro ao carregar produtos",
        description: "Houve um problema ao carregar os produtos. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log("🏁 [useProducts] Loading completed");
    }
  };

  // Force refresh function
  const forceRefreshProducts = async () => {
    console.log("🔄 [useProducts] Force refreshing products from Supabase");
    setIsLoading(true);
    
    try {
      // Clear cache
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      // Fetch from Supabase
      const fetchedProducts = await productService.getAll();
      console.log("✅ [useProducts] Forcefully loaded", fetchedProducts?.length || 0, "products from Supabase");
      
      if (fetchedProducts && Array.isArray(fetchedProducts)) {
        console.log("🎯 [useProducts] Force refresh - setting", fetchedProducts.length, "products");
        setProducts(fetchedProducts);
        
        // Update cache
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(fetchedProducts));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        
        toast({
          title: 'Produtos atualizados',
          description: `${fetchedProducts.length} produtos carregados com sucesso!`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ [useProducts] Error during force refresh:', error);
      
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

  // Listen for product updates from other components
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log("📡 [useProducts] Products updated event received, refreshing...");
      forceRefreshProducts();
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  // Initial load
  useEffect(() => {
    console.log("🚀 [useProducts] Initial load triggered");
    loadProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      console.log("➕ [useProducts] Adding new product:", product);
      
      const newProduct = await productService.create(product);
      console.log("✅ [useProducts] Product created:", newProduct);
      
      // Update local state immediately
      setProducts((prev) => {
        const updated = [...prev, newProduct];
        console.log("📊 [useProducts] Updated products state, new count:", updated.length);
        return updated;
      });
      
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
      console.error('❌ [useProducts] Error adding product:', error);
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
      console.log("🔄 [useProducts] Updating product:", id, product);
      
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
      console.error('❌ [useProducts] Error updating product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o produto.',
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log("🗑️ [useProducts] Deleting product:", id);
      
      // Delete from Supabase first
      await productService.delete(id);
      
      // Update local state immediately
      setProducts((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        console.log("📊 [useProducts] After delete, products count:", filtered.length);
        return filtered;
      });
      
      // Update cache
      const updatedProducts = products.filter((item) => item.id !== id);
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Produto excluído',
        description: 'Produto excluído com sucesso!',
      });
    } catch (error) {
      console.error('❌ [useProducts] Error deleting product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
    }
  };

  const syncPendingProducts = async () => {
    setIsSyncing(true);
    try {
      const result = await forceRefreshProducts();
      setIsSyncing(false);
      return result;
    } catch (error) {
      console.error('❌ [useProducts] Error syncing products:', error);
      setIsSyncing(false);
      return false;
    }
  };

  console.log("🔍 [useProducts] Current state - products:", products.length, "loading:", isLoading);

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
    console.log("🔄 [fetchProducts] Fetching products...");
    const result = await productService.getAll();
    console.log("✅ [fetchProducts] Fetched", result?.length || 0, "products");
    return result;
  } catch (error) {
    console.error('❌ [fetchProducts] Error:', error);
    return [];
  }
};
