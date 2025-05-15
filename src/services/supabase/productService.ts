
import { Product } from '@/types';
import { productLocalService } from '../local/productLocalService';

/**
 * Service for product operations
 * Now using local storage instead of Supabase
 */
export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    return productLocalService.getAll();
  },

  // Get product by ID
  getById: async (id: string): Promise<Product | null> => {
    return productLocalService.getById(id);
  },

  // Add product
  add: async (product: Omit<Product, 'id'>): Promise<string> => {
    const productWithDates = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return productLocalService.add(productWithDates);
  },

  // Update product
  update: async (id: string, product: Partial<Product>): Promise<void> => {
    const updateData = {
      ...product,
      updatedAt: new Date()
    };
    return productLocalService.update(id, updateData);
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    return productLocalService.delete(id);
  },

  // Get product by code
  getByCode: async (code: number): Promise<Product | null> => {
    return productLocalService.getByCode(code);
  }
};

/**
 * Create multiple products at once
 * @param products Array of products to create
 * @returns Array of generated IDs
 */
export const createBulkProducts = async (products: Omit<Product, 'id'>[]): Promise<string[]> => {
  try {
    const results: string[] = [];
    
    for (const product of products) {
      const id = await productService.add(product);
      results.push(id);
    }
    
    return results;
  } catch (error) {
    console.error("Error creating bulk products:", error);
    throw error;
  }
};
