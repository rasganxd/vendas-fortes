
import { ProductGroup } from '@/types';
import { productGroupLocalService } from '../local/productGroupLocalService';

/**
 * Service for product group operations
 * Using local storage instead of Supabase
 */
export const productGroupService = {
  // Get all product groups
  getAll: async (): Promise<ProductGroup[]> => {
    return productGroupLocalService.getAll();
  },
  
  // Get product group by ID
  getById: async (id: string): Promise<ProductGroup | null> => {
    return productGroupLocalService.getById(id);
  },
  
  // Add product group
  add: async (group: Omit<ProductGroup, 'id'>): Promise<string> => {
    return productGroupLocalService.add(group);
  },
  
  // Update product group
  update: async (id: string, group: Partial<ProductGroup>): Promise<void> => {
    const updateData = {
      ...group,
      updatedAt: new Date()
    };
    return productGroupLocalService.update(id, updateData);
  },
  
  // Delete product group
  delete: async (id: string): Promise<void> => {
    return productGroupLocalService.delete(id);
  }
};
