
import { ProductGroup } from '@/types';
import { productGroupFirestoreService } from './ProductGroupFirestoreService';
import { where } from 'firebase/firestore';

/**
 * Service for product group operations using Firebase
 */
export const productGroupService = {
  // Get all product groups
  getAll: async (): Promise<ProductGroup[]> => {
    try {
      console.log("Getting all product groups...");
      const groups = await productGroupFirestoreService.getAll();
      console.log(`Retrieved ${groups.length} product groups from Firestore`);
      
      // Remove duplicates by name
      const uniqueGroups = groups.reduce((acc: ProductGroup[], current) => {
        const existingGroup = acc.find(item => item.name === current.name);
        if (!existingGroup) {
          acc.push(current);
        } else {
          console.log(`Found duplicate group with name: ${current.name}, keeping only one instance`);
        }
        return acc;
      }, []);
      
      console.log(`Returning ${uniqueGroups.length} unique product groups`);
      return uniqueGroups;
    } catch (error) {
      console.error("Error getting all product groups:", error);
      return [];
    }
  },
  
  // Get product group by ID
  getById: async (id: string): Promise<ProductGroup | null> => {
    try {
      console.log(`Getting product group with ID: ${id}`);
      return await productGroupFirestoreService.getById(id);
    } catch (error) {
      console.error(`Error getting product group with ID ${id}:`, error);
      return null;
    }
  },
  
  // Get product group by name
  getByName: async (name: string): Promise<ProductGroup | null> => {
    try {
      console.log(`Getting product group with name: ${name}`);
      return await productGroupFirestoreService.getByName(name);
    } catch (error) {
      console.error(`Error getting product group with name ${name}:`, error);
      return null;
    }
  },
  
  // Get all product groups with the same name
  getAllByName: async (name: string): Promise<ProductGroup[]> => {
    try {
      console.log(`Getting all product groups with name: ${name}`);
      return await productGroupFirestoreService.query([where('name', '==', name)]);
    } catch (error) {
      console.error(`ProductGroupService: Error getting groups by name ${name}:`, error);
      return [];
    }
  },
  
  // Add product group
  add: async (group: Omit<ProductGroup, 'id'>): Promise<string> => {
    try {
      console.log(`Adding new product group: ${group.name}`);
      
      // Check if group with same name already exists
      const existingGroup = await productGroupFirestoreService.getByName(group.name);
      
      if (existingGroup) {
        console.log(`Group with name '${group.name}' already exists with ID: ${existingGroup.id}`);
        return existingGroup.id;
      }
      
      const groupWithDates = {
        ...group,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const id = await productGroupFirestoreService.add(groupWithDates);
      console.log(`Added new product group with ID: ${id}`);
      return id;
    } catch (error) {
      console.error(`Error adding product group ${group.name}:`, error);
      throw error;
    }
  },
  
  // Update product group
  update: async (id: string, group: Partial<ProductGroup>): Promise<void> => {
    try {
      console.log(`Updating product group with ID ${id}:`, group);
      const updateData = {
        ...group,
        updatedAt: new Date()
      };
      await productGroupFirestoreService.update(id, updateData);
      console.log(`Updated product group with ID: ${id}`);
    } catch (error) {
      console.error(`Error updating product group with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete product group by ID
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting product group with ID: ${id}`);
      await productGroupFirestoreService.delete(id);
      console.log(`Deleted product group with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting product group with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete all product groups with the same name
  deleteAllByName: async (name: string): Promise<void> => {
    try {
      console.log(`Deleting all groups with name: ${name}`);
      const groups = await productGroupFirestoreService.query([where('name', '==', name)]);
      
      console.log(`Found ${groups.length} groups with name: ${name}`);
      
      // Delete each group with the same name
      const deletePromises = groups.map(group => 
        productGroupFirestoreService.delete(group.id)
      );
      
      await Promise.all(deletePromises);
      console.log(`Deleted all groups with name: ${name}`);
    } catch (error) {
      console.error(`Error deleting all groups with name ${name}:`, error);
      throw error;
    }
  }
};
