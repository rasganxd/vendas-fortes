
import { ProductBrand } from '@/types';
import { productBrandFirestoreService } from './ProductBrandFirestoreService';
import { where } from 'firebase/firestore';

/**
 * Service for product brand operations using Firebase
 */
export const productBrandService = {
  // Get all product brands
  getAll: async (): Promise<ProductBrand[]> => {
    try {
      console.log("Getting all product brands...");
      const brands = await productBrandFirestoreService.getAll();
      console.log(`Retrieved ${brands.length} product brands from Firestore`);
      
      // Remove duplicates by name
      const uniqueBrands = brands.reduce((acc: ProductBrand[], current) => {
        const existingBrand = acc.find(item => item.name === current.name);
        if (!existingBrand) {
          acc.push(current);
        } else {
          console.log(`Found duplicate brand with name: ${current.name}, keeping only one instance`);
        }
        return acc;
      }, []);
      
      console.log(`Returning ${uniqueBrands.length} unique product brands`);
      return uniqueBrands;
    } catch (error) {
      console.error("Error getting all product brands:", error);
      return [];
    }
  },
  
  // Get product brand by ID
  getById: async (id: string): Promise<ProductBrand | null> => {
    try {
      console.log(`Getting product brand with ID: ${id}`);
      return await productBrandFirestoreService.getById(id);
    } catch (error) {
      console.error(`Error getting product brand with ID ${id}:`, error);
      return null;
    }
  },
  
  // Get product brand by name
  getByName: async (name: string): Promise<ProductBrand | null> => {
    try {
      console.log(`Getting product brand with name: ${name}`);
      return await productBrandFirestoreService.getByName(name);
    } catch (error) {
      console.error(`Error getting product brand with name ${name}:`, error);
      return null;
    }
  },
  
  // Get all product brands with the same name
  getAllByName: async (name: string): Promise<ProductBrand[]> => {
    try {
      console.log(`Getting all product brands with name: ${name}`);
      return await productBrandFirestoreService.query([where('name', '==', name)]);
    } catch (error) {
      console.error(`ProductBrandService: Error getting brands by name ${name}:`, error);
      return [];
    }
  },
  
  // Add product brand
  add: async (brand: Omit<ProductBrand, 'id'>): Promise<string> => {
    try {
      console.log(`Adding new product brand: ${brand.name}`);
      
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
      const id = await productBrandFirestoreService.add(brandWithDates);
      console.log(`Added new product brand with ID: ${id}`);
      return id;
    } catch (error) {
      console.error(`Error adding product brand ${brand.name}:`, error);
      throw error;
    }
  },
  
  // Update product brand
  update: async (id: string, brand: Partial<ProductBrand>): Promise<void> => {
    try {
      console.log(`Updating product brand with ID ${id}:`, brand);
      const updateData = {
        ...brand,
        updatedAt: new Date()
      };
      await productBrandFirestoreService.update(id, updateData);
      console.log(`Updated product brand with ID: ${id}`);
    } catch (error) {
      console.error(`Error updating product brand with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete product brand by ID
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting product brand with ID: ${id}`);
      await productBrandFirestoreService.delete(id);
      console.log(`Deleted product brand with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting product brand with ID ${id}:`, error);
      throw error;
    }
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
