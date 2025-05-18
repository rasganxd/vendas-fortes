
import { ProductCategory } from '@/types';
import { productCategoryFirestoreService } from './ProductCategoryFirestoreService';

/**
 * Service for product category operations using Firebase
 */
export const productCategoryService = {
  // Get all product categories
  getAll: async (): Promise<ProductCategory[]> => {
    return productCategoryFirestoreService.getAll();
  },
  
  // Get product category by ID
  getById: async (id: string): Promise<ProductCategory | null> => {
    return productCategoryFirestoreService.getById(id);
  },
  
  // Get product category by name
  getByName: async (name: string): Promise<ProductCategory | null> => {
    return productCategoryFirestoreService.getByName(name);
  },
  
  // Add product category
  add: async (category: Omit<ProductCategory, 'id'>): Promise<string> => {
    const categoryWithDates = {
      ...category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return productCategoryFirestoreService.add(categoryWithDates);
  },
  
  // Update product category
  update: async (id: string, category: Partial<ProductCategory>): Promise<void> => {
    const updateData = {
      ...category,
      updatedAt: new Date()
    };
    return productCategoryFirestoreService.update(id, updateData);
  },
  
  // Delete product category
  delete: async (id: string): Promise<void> => {
    return productCategoryFirestoreService.delete(id);
  }
};
