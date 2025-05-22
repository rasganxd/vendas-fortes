import { ProductCategory } from '@/types';
import { productCategoryFirestoreService } from './ProductCategoryFirestoreService';
import { where } from 'firebase/firestore';

/**
 * Service for product category operations using Firebase
 */
export const productCategoryService = {
  // Get all product categories
  getAll: async (): Promise<ProductCategory[]> => {
    const categories = await productCategoryFirestoreService.getAll();
    
    // Remove duplicates by name
    const uniqueCategories = categories.reduce((acc: ProductCategory[], current) => {
      const existingCategory = acc.find(item => item.name === current.name);
      if (!existingCategory) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return uniqueCategories;
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
      return await productCategoryFirestoreService.query([where('name', '==', name)]);
    } catch (error) {
      console.error(`ProductCategoryService: Error getting categories by name ${name}:`, error);
      return [];
    }
  },
  
  // Add product category
  add: async (category: Omit<ProductCategory, 'id'>): Promise<string> => {
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
  },
  
  // Clean up duplicate categories
  cleanupDuplicates: async (): Promise<void> => {
    try {
      console.log("Starting cleanup of duplicate categories");
      const categories = await productCategoryFirestoreService.getAll();
      
      // Group categories by name
      const categoriesByName = categories.reduce((acc, category) => {
        if (!acc[category.name]) {
          acc[category.name] = [];
        }
        acc[category.name].push(category);
        return acc;
      }, {} as Record<string, ProductCategory[]>);
      
      // For each group of categories with the same name, keep only the first one
      for (const [name, categoriesGroup] of Object.entries(categoriesByName)) {
        if (categoriesGroup.length > 1) {
          console.log(`Found ${categoriesGroup.length} duplicates for category: ${name}`);
          
          // Keep the first category, delete the rest
          const [toKeep, ...toDelete] = categoriesGroup;
          
          // Delete each duplicate
          const deletePromises = toDelete.map(category => 
            productCategoryFirestoreService.delete(category.id)
          );
          
          await Promise.all(deletePromises);
          console.log(`Kept category ${toKeep.id} and deleted ${toDelete.length} duplicates for: ${name}`);
        }
      }
      
      console.log("Finished cleanup of duplicate categories");
    } catch (error) {
      console.error("Error cleaning up duplicate categories:", error);
      throw error;
    }
  }
};
