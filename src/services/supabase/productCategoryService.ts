
import { ProductCategory } from '@/types';
import { productCategoryLocalService } from '../local/productCategoryLocalService';

/**
 * Service for product category operations
 * Using local storage instead of Supabase
 */
export const productCategoryService = {
  // Get all product categories
  getAll: async (): Promise<ProductCategory[]> => {
    return productCategoryLocalService.getAll();
  },
  
  // Get product category by ID
  getById: async (id: string): Promise<ProductCategory | null> => {
    return productCategoryLocalService.getById(id);
  },
  
  // Add product category
  add: async (category: Omit<ProductCategory, 'id'>): Promise<string> => {
    return productCategoryLocalService.add(category);
  },
  
  // Update product category
  update: async (id: string, category: Partial<ProductCategory>): Promise<void> => {
    const updateData = {
      ...category,
      updatedAt: new Date()
    };
    return productCategoryLocalService.update(id, updateData);
  },
  
  // Delete product category
  delete: async (id: string): Promise<void> => {
    return productCategoryLocalService.delete(id);
  }
};
