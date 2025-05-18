
import { ProductCategory } from '@/types';
import { productCategoryService as firebaseProductCategoryService } from '../firebase/productCategoryService';

/**
 * Service for product category operations
 * Using Firebase instead of local storage
 */
export const productCategoryService = {
  // Get all product categories
  getAll: async (): Promise<ProductCategory[]> => {
    return firebaseProductCategoryService.getAll();
  },
  
  // Get product category by ID
  getById: async (id: string): Promise<ProductCategory | null> => {
    return firebaseProductCategoryService.getById(id);
  },
  
  // Add product category
  add: async (category: Omit<ProductCategory, 'id'>): Promise<string> => {
    return firebaseProductCategoryService.add(category);
  },
  
  // Update product category
  update: async (id: string, category: Partial<ProductCategory>): Promise<void> => {
    return firebaseProductCategoryService.update(id, category);
  },
  
  // Delete product category
  delete: async (id: string): Promise<void> => {
    return firebaseProductCategoryService.delete(id);
  }
};
