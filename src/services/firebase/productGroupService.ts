
import { ProductGroup } from '@/types';
import { productGroupFirestoreService } from './ProductGroupFirestoreService';
import { where } from 'firebase/firestore';

/**
 * Service for product group operations using Firebase
 */
export const productGroupService = {
  // Get all product groups
  getAll: async (): Promise<ProductGroup[]> => {
    const groups = await productGroupFirestoreService.getAll();
    
    // Remove duplicates by name
    const uniqueGroups = groups.reduce((acc: ProductGroup[], current) => {
      const existingGroup = acc.find(item => item.name === current.name);
      if (!existingGroup) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return uniqueGroups;
  },
  
  // Get product group by ID
  getById: async (id: string): Promise<ProductGroup | null> => {
    return productGroupFirestoreService.getById(id);
  },
  
  // Get product group by name
  getByName: async (name: string): Promise<ProductGroup | null> => {
    return productGroupFirestoreService.getByName(name);
  },
  
  // Get all product groups with the same name
  getAllByName: async (name: string): Promise<ProductGroup[]> => {
    try {
      return await productGroupFirestoreService.query([where('name', '==', name)]);
    } catch (error) {
      console.error(`ProductGroupService: Error getting groups by name ${name}:`, error);
      return [];
    }
  },
  
  // Add product group
  add: async (group: Omit<ProductGroup, 'id'>): Promise<string> => {
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
    return productGroupFirestoreService.add(groupWithDates);
  },
  
  // Update product group
  update: async (id: string, group: Partial<ProductGroup>): Promise<void> => {
    const updateData = {
      ...group,
      updatedAt: new Date()
    };
    return productGroupFirestoreService.update(id, updateData);
  },
  
  // Delete product group by ID
  delete: async (id: string): Promise<void> => {
    return productGroupFirestoreService.delete(id);
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
