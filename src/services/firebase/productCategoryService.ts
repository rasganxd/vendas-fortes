
import { ProductCategory } from '@/types';
import { productCategoryFirestoreService } from './ProductCategoryFirestoreService';
import { where } from 'firebase/firestore';

/**
 * Service for product category operations using Firebase
 */
export const productCategoryService = {
  // Get all product categories
  getAll: async (): Promise<ProductCategory[]> => {
    try {
      console.log("Getting all product categories...");
      const categories = await productCategoryFirestoreService.getAll();
      console.log(`Retrieved ${categories.length} product categories from Firestore`);
      
      // Remove duplicates by name
      const uniqueCategories = categories.reduce((acc: ProductCategory[], current) => {
        const existingCategory = acc.find(item => item.name === current.name);
        if (!existingCategory) {
          acc.push(current);
        } else {
          console.log(`Found duplicate category with name: ${current.name}, keeping only one instance`);
        }
        return acc;
      }, []);
      
      console.log(`Returning ${uniqueCategories.length} unique product categories`);
      return uniqueCategories;
    } catch (error) {
      console.error("Error getting all product categories:", error);
      return [];
    }
  },
  
  // Get product category by ID
  getById: async (id: string): Promise<ProductCategory | null> => {
    return productCategoryFirestoreService.getById(id);
  },
  
  // Get product category by name
  getByName: async (name: string): Promise<ProductCategory | null> => {
    return productCategoryFirestoreService.getByName(name);
  },
  
  // Get all product categories with the same name
  getAllByName: async (name: string): Promise<ProductCategory[]> => {
    try {
      console.log(`Getting all product categories with name: ${name}`);
      const results = await productCategoryFirestoreService.query([where('name', '==', name)]);
      console.log(`Found ${results.length} categories with name: ${name}`);
      return results;
    } catch (error) {
      console.error(`ProductCategoryService: Error getting categories by name ${name}:`, error);
      return [];
    }
  },
  
  // Add product category
  add: async (category: Omit<ProductCategory, 'id'>): Promise<string> => {
    try {
      console.log(`Adding new product category: ${category.name}`);
      
      // Check if category with same name already exists
      const existingCategory = await productCategoryFirestoreService.getByName(category.name);
      
      if (existingCategory) {
        console.log(`Category with name '${category.name}' already exists with ID: ${existingCategory.id}`);
        return existingCategory.id;
      }
      
      const categoryWithDates = {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const id = await productCategoryFirestoreService.add(categoryWithDates);
      console.log(`Added new product category with ID: ${id}`);
      return id;
    } catch (error) {
      console.error(`Error adding product category ${category.name}:`, error);
      throw error;
    }
  },
  
  // Update product category
  update: async (id: string, category: Partial<ProductCategory>): Promise<void> => {
    const updateData = {
      ...category,
      updatedAt: new Date()
    };
    return productCategoryFirestoreService.update(id, updateData);
  },
  
  // Delete product category by ID
  delete: async (id: string): Promise<void> => {
    return productCategoryFirestoreService.delete(id);
  },
  
  // Delete all product categories with the same name
  deleteAllByName: async (name: string): Promise<void> => {
    try {
      console.log(`Deleting all categories with name: ${name}`);
      const categories = await productCategoryFirestoreService.query([where('name', '==', name)]);
      
      console.log(`Found ${categories.length} categories with name: ${name}`);
      
      // Delete each category with the same name
      const deletePromises = categories.map(category => 
        productCategoryFirestoreService.delete(category.id)
      );
      
      await Promise.all(deletePromises);
      console.log(`Deleted all categories with name: ${name}`);
    } catch (error) {
      console.error(`Error deleting all categories with name ${name}:`, error);
      throw error;
    }
  }
};
