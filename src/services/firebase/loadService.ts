
import { Load } from '@/types';
import { loadFirestoreService } from './LoadFirestoreService';

/**
 * Service for load operations using Firebase
 */
export const loadService = {
  // Get all loads
  getAll: async (): Promise<Load[]> => {
    return loadFirestoreService.getAll();
  },
  
  // Get load by ID
  getById: async (id: string): Promise<Load | null> => {
    return loadFirestoreService.getById(id);
  },
  
  // Get load by code
  getByCode: async (code: number): Promise<Load | null> => {
    return loadFirestoreService.getByCode(code);
  },
  
  // Add load
  add: async (load: Omit<Load, 'id'>): Promise<string> => {
    const loadWithDates = {
      ...load,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return loadFirestoreService.add(loadWithDates);
  },
  
  // Update load
  update: async (id: string, load: Partial<Load>): Promise<void> => {
    const updateData = {
      ...load,
      updatedAt: new Date()
    };
    return loadFirestoreService.update(id, updateData);
  },
  
  // Delete load
  delete: async (id: string): Promise<void> => {
    return loadFirestoreService.delete(id);
  },
  
  // Generate next load code
  generateNextCode: async (): Promise<number> => {
    const highestCode = await loadFirestoreService.getHighestCode();
    return highestCode + 1;
  }
};
