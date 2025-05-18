
import { ProductBrand } from '@/types';
import { productBrandService as firebaseProductBrandService } from '../firebase/productBrandService';

/**
 * Service for product brand operations
 * Using Firebase instead of local storage
 */
export const productBrandService = {
  // Get all product brands
  getAll: async (): Promise<ProductBrand[]> => {
    return firebaseProductBrandService.getAll();
  },
  
  // Get product brand by ID
  getById: async (id: string): Promise<ProductBrand | null> => {
    return firebaseProductBrandService.getById(id);
  },
  
  // Add product brand
  add: async (brand: Omit<ProductBrand, 'id'>): Promise<string> => {
    return firebaseProductBrandService.add(brand);
  },
  
  // Update product brand
  update: async (id: string, brand: Partial<ProductBrand>): Promise<void> => {
    return firebaseProductBrandService.update(id, brand);
  },
  
  // Delete product brand
  delete: async (id: string): Promise<void> => {
    return firebaseProductBrandService.delete(id);
  }
};
