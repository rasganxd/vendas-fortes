
import { ProductCategory } from '@/types';
import { LocalStorageService } from '../local/localStorageService';

/**
 * LocalStorage service for product categories
 */
class ProductCategoryLocalService extends LocalStorageService<ProductCategory> {
  constructor() {
    super('product_categories');
  }
}

// Create a singleton instance
export const productCategoryLocalService = new ProductCategoryLocalService();

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
    const categoryWithDates = {
      ...category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return productCategoryLocalService.add(categoryWithDates);
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
