
import { Product } from '@/types';
import { productFirestoreService } from './ProductFirestoreService';
import { productLocalService } from '../local/productLocalService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';

// Cache keys for product data
const PRODUCTS_CACHE_KEY = 'app_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'app_products_cache_timestamp';

/**
 * Service for product operations
 * Using Firebase with localStorage sync for offline support
 */
export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    try {
      console.log("productService: Starting getAll products request");
      const result = await productFirestoreService.getAll();
      console.log(`productService: Retrieved ${result.length} products from Firestore`);
      
      // Sync to local storage for offline use with synced status
      const productsWithStatus = result.map(product => ({
        ...product,
        syncStatus: 'synced' as const
      }));
      
      await productLocalService.setAll(productsWithStatus);
      
      // Also update cache for quick access
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productsWithStatus));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      // Log detailed information about the first few products (if any)
      if (result.length > 0) {
        console.log("productService: Sample product data:", 
          result.slice(0, Math.min(3, result.length)).map(product => ({
            id: product.id,
            code: product.code,
            name: product.name,
            price: product.price
          }))
        );
      } else {
        console.log("productService: No products returned from Firestore");
      }
      
      return productsWithStatus;
    } catch (error) {
      console.error("Error in productService.getAll:", error);
      
      // Fall back to local storage if Firebase fails
      console.log("productService: Falling back to local storage");
      const localProducts = await productLocalService.getAll();
      console.log(`productService: Retrieved ${localProducts.length} products from local storage`);
      
      return localProducts;
    }
  },

  // Get product by ID
  getById: async (id: string): Promise<Product | null> => {
    try {
      console.log(`productService: Getting product by ID: ${id}`);
      const product = await productFirestoreService.getById(id);
      
      if (product) {
        console.log(`productService: Found product with ID ${id}:`, {
          id: product.id,
          code: product.code,
          name: product.name,
          price: product.price
        });
        
        // Sync to local storage for offline use
        const productWithStatus = {
          ...product,
          syncStatus: 'synced' as const
        };
        
        await productLocalService.update(id, productWithStatus);
      } else {
        console.log(`productService: No product found with ID ${id}`);
      }
      
      return product;
    } catch (error) {
      console.error(`Error in productService.getById(${id}):`, error);
      
      // Fall back to local storage
      return productLocalService.getById(id);
    }
  },

  // Add product
  add: async (product: Omit<Product, 'id'>): Promise<string> => {
    try {
      console.log("productService: Adding new product:", {
        name: product.name,
        code: product.code,
        price: product.price
      });
      
      // Ensure date fields are properly set
      const productWithDates = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Get or generate ID
      const id = await productFirestoreService.add(productWithDates);
      console.log(`productService: Product added successfully with ID: ${id}`);
      
      // Sync to local storage for offline use
      const newProduct = { 
        ...productWithDates, 
        id,
        syncStatus: 'synced' 
      } as Product;
      
      // Ensure localStorage is updated
      await productLocalService.forceSave(newProduct);
      
      // Update cache too
      const cachedProducts = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '[]');
      cachedProducts.push(newProduct);
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cachedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast("Produto adicionado", {
        description: "Produto adicionado e sincronizado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Error in productService.add:", error);
      toast("Erro de conexão", {
        description: "Produto salvo localmente. Será sincronizado quando houver conexão."
      });
      
      // If Firebase fails, try to add to local storage with a temporary UUID and pending status
      try {
        const tempId = uuidv4();
        const productWithStatus = {
          ...product, 
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending'
        };
        
        await productLocalService.add(productWithStatus);
        
        // Update cache too
        const cachedProducts = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '[]');
        cachedProducts.push(productWithStatus);
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cachedProducts));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        
        console.log(`productService: Added product to local storage with temporary ID: ${tempId}`);
        return tempId;
      } catch (localError) {
        console.error("Failed to add product to local storage:", localError);
        toast("Erro crítico", {
          description: "Não foi possível salvar o produto nem localmente."
        });
        throw error; // Re-throw the original error
      }
    }
  },

  // Update product
  update: async (id: string, product: Partial<Product>): Promise<void> => {
    try {
      console.log(`productService: Updating product ${id} with:`, product);
      const updateData = {
        ...product,
        updatedAt: new Date(),
        syncStatus: 'synced'
      };
      
      await productFirestoreService.update(id, updateData);
      console.log(`productService: Product ${id} updated successfully`);
      
      // Sync to local storage
      await productLocalService.update(id, updateData);
      
      // Update cache too
      const cachedProducts = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '[]');
      const productIndex = cachedProducts.findIndex((p: Product) => p.id === id);
      if (productIndex >= 0) {
        cachedProducts[productIndex] = {...cachedProducts[productIndex], ...updateData};
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cachedProducts));
        localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
      
      toast("Produto atualizado", {
        description: "Produto atualizado e sincronizado com sucesso!"
      });
    } catch (error) {
      console.error(`Error in productService.update(${id}):`, error);
      toast("Erro de conexão", {
        description: "Produto atualizado localmente. Será sincronizado quando houver conexão."
      });
      
      // Try to update local storage even if Firebase fails
      try {
        const updateData = {
          ...product,
          updatedAt: new Date(),
          syncStatus: 'pending'
        };
        
        await productLocalService.update(id, updateData);
        
        // Update cache too
        const cachedProducts = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '[]');
        const productIndex = cachedProducts.findIndex((p: Product) => p.id === id);
        if (productIndex >= 0) {
          cachedProducts[productIndex] = {...cachedProducts[productIndex], ...updateData};
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cachedProducts));
          localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        }
        
        console.log(`productService: Updated product ${id} in local storage only`);
      } catch (localError) {
        console.error("Failed to update product in local storage:", localError);
      }
    }
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`productService: Deleting product ${id}`);
      await productFirestoreService.delete(id);
      console.log(`productService: Product ${id} deleted successfully`);
      
      // Sync to local storage
      await productLocalService.delete(id);
      
      // Update cache too
      const cachedProducts = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '[]');
      const updatedCache = cachedProducts.filter((p: Product) => p.id !== id);
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedCache));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast("Produto excluído", {
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error(`Error in productService.delete(${id}):`, error);
      toast("Erro ao excluir", {
        description: "Não foi possível excluir o produto do servidor."
      });
      
      // Mark as pending deletion in local storage
      try {
        await productLocalService.update(id, { syncStatus: 'pending' });
        console.log(`productService: Marked product ${id} for deletion in local storage`);
      } catch (localError) {
        console.error("Failed to mark product for deletion in local storage:", localError);
      }
    }
  },

  // Get product by code
  getByCode: async (code: number): Promise<Product | null> => {
    try {
      console.log(`productService: Getting product by code ${code}`);
      const product = await productFirestoreService.getByCode(code);
      
      if (product) {
        console.log(`productService: Found product with code ${code}`);
        // Sync to local storage
        await productLocalService.update(product.id, {
          ...product,
          syncStatus: 'synced'
        });
      } else {
        console.log(`productService: No product found with code ${code}`);
      }
      
      return product;
    } catch (error) {
      console.error(`Error in productService.getByCode(${code}):`, error);
      
      // Fall back to local storage
      return productLocalService.getByCode(code);
    }
  },
  
  // Synchronize pending products
  syncPendingProducts: async (): Promise<{success: number, failed: number}> => {
    try {
      console.log("productService: Starting synchronization of pending products");
      
      // Get all products from local storage
      const localProducts = await productLocalService.getAll();
      
      // Filter products with pending sync status
      const pendingProducts = localProducts.filter(p => p.syncStatus === 'pending');
      console.log(`productService: Found ${pendingProducts.length} pending products to sync`);
      
      if (pendingProducts.length === 0) {
        return { success: 0, failed: 0 };
      }
      
      let successCount = 0;
      let failedCount = 0;
      
      // Process each pending product
      for (const product of pendingProducts) {
        try {
          const { id, ...productData } = product;
          
          // Update in Firestore
          await productFirestoreService.update(id, {
            ...productData,
            syncStatus: 'synced'
          });
          
          // Update local status
          await productLocalService.update(id, { syncStatus: 'synced' });
          
          console.log(`productService: Successfully synced product ${id}`);
          successCount++;
        } catch (error) {
          console.error(`productService: Failed to sync product ${product.id}:`, error);
          failedCount++;
        }
      }
      
      // Update cache
      const updatedProducts = await productLocalService.getAll();
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      console.log(`productService: Sync completed - Success: ${successCount}, Failed: ${failedCount}`);
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error("Error in syncPendingProducts:", error);
      return { success: 0, failed: 0 };
    }
  },
  
  // Force refresh all products from Firebase
  forceRefresh: async (): Promise<Product[]> => {
    try {
      console.log("productService: Force refreshing products from Firebase");
      
      // Clear cache first
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
      
      // Get fresh data from Firebase
      const result = await productFirestoreService.getAll();
      console.log(`productService: Retrieved ${result.length} products from Firestore`);
      
      // Add syncStatus to all products
      const productsWithStatus = result.map(product => ({
        ...product,
        syncStatus: 'synced' as const
      }));
      
      // Update local storage
      await productLocalService.setAll(productsWithStatus);
      
      // Update cache
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productsWithStatus));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      return productsWithStatus;
    } catch (error) {
      console.error("Error in productService.forceRefresh:", error);
      throw error;
    }
  }
};

/**
 * Create multiple products at once
 * @param products Array of products to create
 * @returns Array of generated IDs
 */
export const createBulkProducts = async (products: Omit<Product, 'id'>[]): Promise<string[]> => {
  try {
    console.log(`productService: Creating ${products.length} products in bulk`);
    const results: string[] = [];
    
    // Process products in batches to avoid overwhelming Firebase
    for (const product of products) {
      const id = await productService.add(product);
      results.push(id);
    }
    
    console.log(`productService: Successfully created ${results.length} products in bulk`);
    return results;
  } catch (error) {
    console.error("Error in createBulkProducts:", error);
    throw error;
  }
};
