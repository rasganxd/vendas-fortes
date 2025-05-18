
import { ProductGroup } from '@/types';
import { productGroupService as firebaseProductGroupService } from '../firebase/productGroupService';

/**
 * Service for product group operations
 * Using Firebase instead of local storage
 */
export const productGroupService = {
  // Get all product groups
  getAll: async (): Promise<ProductGroup[]> => {
    return firebaseProductGroupService.getAll();
  },
  
  // Get product group by ID
  getById: async (id: string): Promise<ProductGroup | null> => {
    return firebaseProductGroupService.getById(id);
  },
  
  // Add product group
  add: async (group: Omit<ProductGroup, 'id'>): Promise<string> => {
    return firebaseProductGroupService.add(group);
  },
  
  // Update product group
  update: async (id: string, group: Partial<ProductGroup>): Promise<void> => {
    return firebaseProductGroupService.update(id, group);
  },
  
  // Delete product group
  delete: async (id: string): Promise<void> => {
    return firebaseProductGroupService.delete(id);
  }
};
