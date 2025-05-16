
import { Product } from '@/types';
import { productFirestoreService } from './ProductFirestoreService';
import { productLocalService } from '../local/productLocalService';
import { v4 as uuidv4 } from 'uuid';

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
      
      // Sync to local storage for offline use
      await productLocalService.setAll(result);
      
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
      
      return result;
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
        await productLocalService.update(id, product);
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
      const newProduct = { ...productWithDates, id } as Product;
      await productLocalService.add(newProduct);
      
      return id;
    } catch (error) {
      console.error("Error in productService.add:", error);
      
      // If Firebase fails, try to add to local storage with a temporary UUID
      try {
        const tempId = uuidv4();
        await productLocalService.add({
          ...product, 
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`productService: Added product to local storage with temporary ID: ${tempId}`);
        return tempId;
      } catch (localError) {
        console.error("Failed to add product to local storage:", localError);
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
        updatedAt: new Date()
      };
      
      await productFirestoreService.update(id, updateData);
      console.log(`productService: Product ${id} updated successfully`);
      
      // Sync to local storage
      await productLocalService.update(id, updateData);
    } catch (error) {
      console.error(`Error in productService.update(${id}):`, error);
      
      // Try to update local storage even if Firebase fails
      try {
        await productLocalService.update(id, {
          ...product,
          updatedAt: new Date()
        });
        console.log(`productService: Updated product ${id} in local storage only`);
      } catch (localError) {
        console.error("Failed to update product in local storage:", localError);
      }
      
      throw error; // Re-throw the original error
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
    } catch (error) {
      console.error(`Error in productService.delete(${id}):`, error);
      
      // Try to delete from local storage even if Firebase fails
      try {
        await productLocalService.delete(id);
        console.log(`productService: Deleted product ${id} from local storage only`);
      } catch (localError) {
        console.error("Failed to delete product from local storage:", localError);
      }
      
      throw error; // Re-throw the original error
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
        await productLocalService.update(product.id, product);
      } else {
        console.log(`productService: No product found with code ${code}`);
      }
      
      return product;
    } catch (error) {
      console.error(`Error in productService.getByCode(${code}):`, error);
      
      // Fall back to local storage
      return productLocalService.getByCode(code);
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
