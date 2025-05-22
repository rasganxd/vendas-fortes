import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/firebase/productService'; 
import { productLocalService } from '@/services/local/productLocalService';
import { toast } from 'sonner';

// Cache keys
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

// Create a proper useProducts hook
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsData = await loadProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error in useProducts hook:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const clearCache = async () => {
    try {
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      await localStorage.removeItem('app_products');
      
      // Fetch fresh data from Firebase
      const freshProducts = await productService.getAll();
      setProducts(freshProducts);
      
      return true;
    } catch (error) {
      console.error("Error clearing products cache:", error);
      return false;
    }
  };
  
  // Add product operations
  const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
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
      
      console.log("Adding product:", productWithCode);
      
      // Add to local storage
      const id = await productLocalService.add(productWithCode);
      console.log("Product added with ID:", id);
      
      if (!id) {
        throw new Error("Failed to get product ID");
      }
      
      const newProduct = { ...productWithCode, id };
      console.log("New product with ID:", newProduct);
      
      // Atualizar o estado local - ensure we're using the correct setter pattern for state updates
      setProducts(currentProducts => [...currentProducts, newProduct]);
      
      toast("Produto adicionado", {
        description: "Produto adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast("Erro ao adicionar produto", {
        description: "Houve um problema ao adicionar o produto."
      });
      return "";
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
    try {
      // Nunca permitir que o código seja indefinido ou nulo ao atualizar
      const updateData = { ...productData, updatedAt: new Date() };
      if (updateData.code === undefined || updateData.code === null) {
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct && existingProduct.code) {
          updateData.code = existingProduct.code;
        }
      }
      
      // Update in local storage
      await productLocalService.update(id, updateData);
      console.log("Product updated, ID:", id, "Data:", updateData);
      
      // Atualizar o estado local usando a função de atualização correta
      setProducts(currentProducts => 
        currentProducts.map(p => p.id === id ? { ...p, ...updateData } : p)
      );
      
      toast("Produto atualizado", {
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast("Erro ao atualizar produto", {
        description: "Houve um problema ao atualizar o produto."
      });
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      console.log(`Deleting product ${id}`);
      
      // Delete from Firebase first
      await productService.delete(id);
      
      // Update local state
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      
      // Update localStorage cache
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      // Update local storage service
      await productLocalService.delete(id);
      
      toast("Produto excluído", {
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast("Erro ao excluir produto", {
        description: "Houve um problema ao excluir o produto."
      });
      throw error;
    }
  };

  const validateProductDiscount = (productId: string, discountedPrice: number): string | boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return true;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) return true;
    if (product.price <= 0) return false;
    
    const discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
    
    // Return string message if invalid, otherwise true
    if (parseFloat(discountPercentage.toFixed(2)) <= parseFloat(product.maxDiscountPercentage.toFixed(2))) {
      return true;
    } else {
      return `O desconto é maior que o máximo permitido (${product.maxDiscountPercentage}%)`;
    }
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

  const addBulkProducts = async (productsArray: Omit<Product, 'id'>[]): Promise<string[]> => {
    try {
      // Preparar dados para armazenamento local
      const productsWithData = productsArray.map(product => {
        // Garantir que o produto tenha um código
        const productCode = product.code || (products.length > 0 
          ? Math.max(...products.map(p => p.code || 0)) + 1 
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
      
      toast("Produtos adicionados", {
        description: `${newProducts.length} produtos foram adicionados com sucesso!`
      });
      
      return ids;
    } catch (error) {
      console.error("Erro ao adicionar produtos em massa:", error);
      toast("Erro ao adicionar produtos", {
        description: "Houve um problema ao adicionar os produtos em massa."
      });
      return [];
    }
  };

  return {
    products,
    isLoading,
    clearCache,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts
  };
};

// Exporting this function so it can be imported directly
export const loadProducts = async (forceRefresh = true): Promise<Product[]> => {
  try {
    if (forceRefresh) {
      console.log("Force refreshing products from Firebase");
      try {
        const products = await productService.getAll();
        
        // Store in localStorage cache
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        
        // Update local storage service cache
        await productLocalService.setAll(products);
        
        console.log(`Loaded ${products.length} products from Firebase`);
        return products;
      } catch (error) {
        console.error("Error fetching products from Firebase:", error);
        throw error;
      }
    }
    
    // Try to get from cache if not forcing refresh
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
    
    // If cache is stale or missing, try Firebase
    try {
      console.log("Getting product data from Firebase");
      const products = await productService.getAll();
      
      // Store in localStorage cache
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      console.log(`Loaded ${products.length} products from Firebase`);
      return products;
    } catch (firebaseError) {
      console.error("Error loading products from Firebase:", firebaseError);
      
      // If Firebase fails, try local storage
      console.log("Falling back to local storage");
      const localProducts = await productLocalService.getAll();
      console.log(`Loaded ${localProducts.length} products from local storage`);
      return localProducts;
    }
  } catch (error) {
    console.error("Error in loadProducts:", error);
    
    // Try to use local storage service as fallback
    try {
      const localProducts = await productLocalService.getAll();
      return localProducts;
    } catch (localError) {
      console.error("Error loading products from local storage:", localError);
      
      // As a last resort, try the cache even if expired
      const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData) as Product[];
      }
      
      // Return empty array instead of throwing
      return [];
    }
  }
};

// For backward compatibility, we keep the old name as well
export const fetchProducts = loadProducts;

// Export a simplified version of product operations without the useDataLoading dependency
export const useProductOperations = () => {
  const deleteProductAndSync = async (
    id: string, 
    products: Product[], 
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  ): Promise<void> => {
    try {
      console.log(`Deleting product ${id}`);
      
      // Delete from Firebase first
      await productService.delete(id);
      
      // Update local state
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      
      // Update localStorage cache
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      // Update local storage service
      await productLocalService.delete(id);
      
      return;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  };
  
  return { 
    deleteProductAndSync
  };
};
