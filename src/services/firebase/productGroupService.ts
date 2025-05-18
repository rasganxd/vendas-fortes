
import { ProductGroup } from '@/types';
import { productGroupFirestoreService } from './ProductGroupFirestoreService';

/**
 * Service for product group operations using Firebase
 */
export const productGroupService = {
  // Get all product groups
  getAll: async (): Promise<ProductGroup[]> => {
    return productGroupFirestoreService.getAll();
  },
  
  // Get product group by ID
  getById: async (id: string): Promise<ProductGroup | null> => {
    return productGroupFirestoreService.getById(id);
  },
  
  // Get product group by name
  getByName: async (name: string): Promise<ProductGroup | null> => {
    return productGroupFirestoreService.getByName(name);
  },
  
  // Add product group
  add: async (group: Omit<ProductGroup, 'id'>): Promise<string> => {
    const groupWithDates = {
      ...group,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return productGroupFirestoreService.add(groupWithDates);
  },
  
  // Update product group
  update: async (id: string, group: Partial<ProductGroup>): Promise<void> => {
    const updateData = {
      ...group,
      updatedAt: new Date()
    };
    return productGroupFirestoreService.update(id, updateData);
  },
  
  // Delete product group
  delete: async (id: string): Promise<void> => {
    return productGroupFirestoreService.delete(id);
  }
};
