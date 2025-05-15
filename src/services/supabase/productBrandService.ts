
import { ProductBrand } from '@/types';
import { productBrandLocalService } from '../local/productBrandLocalService';

/**
 * Service for product brand operations
 * Using local storage instead of Supabase
 */
export const productBrandService = {
  // Get all product brands
  getAll: async (): Promise<ProductBrand[]> => {
    return productBrandLocalService.getAll();
  },
  
  // Get product brand by ID
  getById: async (id: string): Promise<ProductBrand | null> => {
    return productBrandLocalService.getById(id);
  },
  
  // Add product brand
  add: async (brand: Omit<ProductBrand, 'id'>): Promise<string> => {
    return productBrandLocalService.add(brand);
  },
  
  // Update product brand
  update: async (id: string, brand: Partial<ProductBrand>): Promise<void> => {
    const updateData = {
      ...brand,
      updatedAt: new Date()
    };
    return productBrandLocalService.update(id, updateData);
  },
  
  // Delete product brand
  delete: async (id: string): Promise<void> => {
    return productBrandLocalService.delete(id);
  }
};
