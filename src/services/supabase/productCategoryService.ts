
import { ProductCategory } from '@/types';
import { productCategoryService as firebaseProductCategoryService } from '../firebase/productCategoryService';

/**
 * Service for product category operations
 * Using Firebase implementation for all operations
 */
export const productCategoryService = {
  // Get all product categories
  getAll: async (): Promise<ProductCategory[]> => {
    console.log('Supabase productCategoryService.getAll: Delegating to Firebase');
    return firebaseProductCategoryService.getAll();
  },
  
  // Get product category by ID
  getById: async (id: string): Promise<ProductCategory | null> => {
    console.log(`Supabase productCategoryService.getById: Delegating to Firebase for id ${id}`);
    return firebaseProductCategoryService.getById(id);
  },
  
  // Add product category
  add: async (category: Omit<ProductCategory, 'id'>): Promise<string> => {
    console.log('Supabase productCategoryService.add: Delegating to Firebase');
    return firebaseProductCategoryService.add(category);
  },
  
  // Update product category
  update: async (id: string, category: Partial<ProductCategory>): Promise<void> => {
    console.log(`Supabase productCategoryService.update: Delegating to Firebase for id ${id}`);
    return firebaseProductCategoryService.update(id, category);
  },
  
  // Delete product category
  delete: async (id: string): Promise<void> => {
    console.log(`Supabase productCategoryService.delete: Delegating to Firebase for id ${id}`);
    return firebaseProductCategoryService.delete(id);
  }
};

