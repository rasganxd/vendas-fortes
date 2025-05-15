
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { productLocalService } from '@/services/local/productLocalService';
import { Product } from '@/types';
import { productService } from '@/services/supabase/productService';

// Cache key for localStorage
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

export const fetchProducts = async (forceRefresh = false): Promise<Product[]> => {
  try {
    console.log("Attempting to load products with forceRefresh =", forceRefresh);
    
    // Try to get from cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // If cache is still fresh, use it
        if (now - timestamp < CACHE_MAX_AGE) {
          console.log("Using cached product data");
          return JSON.parse(cachedData) as Product[];
        }
      }
    }
    
    // If not in cache or cache is stale, fetch from local storage
    console.log("Fetching product data from local storage");
    const products = await productLocalService.getAll();
    
    // Store in localStorage cache
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    console.log(`Loaded ${products.length} products from local storage`);
    return products;
  } catch (error) {
    console.error("Error loading products:", error);
    
    // Try to use cached data even if expired as fallback
    const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (cachedData) {
      console.log("Using expired cache as fallback due to error");
      return JSON.parse(cachedData) as Product[];
    }
    
    throw error;
  }
};

// Export the fetchProducts function as loadProducts for backward compatibility
export const loadProducts = fetchProducts;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Houve um problema ao carregar os produtos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    try {
      const id = await productService.add(product);
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
      await productService.update(id, product);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...product } : p))
      );
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
      setProducts(prev => prev.filter(p => p.id !== id));
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
  
  return {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts
  };
};
