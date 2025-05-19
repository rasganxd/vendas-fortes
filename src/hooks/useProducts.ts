import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/firebase/productService'; 
import { productLocalService } from '@/services/local/productLocalService';
import { useDataLoading } from '@/context/providers/DataLoadingProvider';

// Cache keys
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

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
      
      throw error;
    }
  }
};

// For backward compatibility, we keep the old name as well
export const fetchProducts = loadProducts;

// Context operations can now leverage these improvements
export const useProductOperations = () => {
  const { clearItemCache } = useDataLoading();
  
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
      
      // Refresh product cache to ensure consistency
      await clearItemCache('products');
      
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
