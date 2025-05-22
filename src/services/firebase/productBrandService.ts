
import { ProductBrand } from '@/types';
import { productBrandFirestoreService } from './ProductBrandFirestoreService';
import { where } from 'firebase/firestore';

/**
 * Service for product brand operations using Firebase
 */
export const productBrandService = {
  // Get all product brands
  getAll: async (): Promise<ProductBrand[]> => {
    const brands = await productBrandFirestoreService.getAll();
    
    // Remove duplicates by name
    const uniqueBrands = brands.reduce((acc: ProductBrand[], current) => {
      const existingBrand = acc.find(item => item.name === current.name);
      if (!existingBrand) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return uniqueBrands;
  },
  
  // Get product brand by ID
  getById: async (id: string): Promise<ProductBrand | null> => {
    return productBrandFirestoreService.getById(id);
  },
  
  // Get product brand by name
  getByName: async (name: string): Promise<ProductBrand | null> => {
    return productBrandFirestoreService.getByName(name);
  },
  
  // Get all product brands with the same name
  getAllByName: async (name: string): Promise<ProductBrand[]> => {
    try {
      return await productBrandFirestoreService.query([where('name', '==', name)]);
    } catch (error) {
      console.error(`ProductBrandService: Error getting brands by name ${name}:`, error);
      return [];
    }
  },
  
  // Add product brand
  add: async (brand: Omit<ProductBrand, 'id'>): Promise<string> => {
    // Check if brand with same name already exists
    const existingBrand = await productBrandFirestoreService.getByName(brand.name);
    
    if (existingBrand) {
      console.log(`Brand with name '${brand.name}' already exists with ID: ${existingBrand.id}`);
      return existingBrand.id;
    }
    
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
  
  // Delete product brand by ID
  delete: async (id: string): Promise<void> => {
    return productBrandFirestoreService.delete(id);
  },
  
  // Delete all product brands with the same name
  deleteAllByName: async (name: string): Promise<void> => {
    try {
      console.log(`Deleting all brands with name: ${name}`);
      const brands = await productBrandFirestoreService.query([where('name', '==', name)]);
      
      console.log(`Found ${brands.length} brands with name: ${name}`);
      
      // Delete each brand with the same name
      const deletePromises = brands.map(brand => 
        productBrandFirestoreService.delete(brand.id)
      );
      
      await Promise.all(deletePromises);
      console.log(`Deleted all brands with name: ${name}`);
    } catch (error) {
      console.error(`Error deleting all brands with name ${name}:`, error);
      throw error;
    }
  }
};
