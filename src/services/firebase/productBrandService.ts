
import { ProductBrand } from '@/types';
import { productBrandFirestoreService } from './ProductBrandFirestoreService';

/**
 * Service for product brand operations using Firebase
 */
export const productBrandService = {
  // Get all product brands
  getAll: async (): Promise<ProductBrand[]> => {
    return productBrandFirestoreService.getAll();
  },
  
  // Get product brand by ID
  getById: async (id: string): Promise<ProductBrand | null> => {
    return productBrandFirestoreService.getById(id);
  },
  
  // Get product brand by name
  getByName: async (name: string): Promise<ProductBrand | null> => {
    return productBrandFirestoreService.getByName(name);
  },
  
  // Add product brand
  add: async (brand: Omit<ProductBrand, 'id'>): Promise<string> => {
    const brandWithDates = {
      ...brand,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return productBrandFirestoreService.add(brandWithDates);
  },
  
  // Update product brand
  update: async (id: string, brand: Partial<ProductBrand>): Promise<void> => {
    const updateData = {
      ...brand,
      updatedAt: new Date()
    };
    return productBrandFirestoreService.update(id, updateData);
  },
  
  // Delete product brand
  delete: async (id: string): Promise<void> => {
    return productBrandFirestoreService.delete(id);
  }
};
