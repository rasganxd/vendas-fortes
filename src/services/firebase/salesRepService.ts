
import { SalesRep } from '@/types';
import { salesRepFirestoreService } from './SalesRepFirestoreService';
import { salesRepLocalService } from '../local/salesRepLocalService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for sales rep-related operations
 * Using Firebase with localStorage sync for offline support
 */
export const salesRepService = {
  // Get all sales reps
  getAll: async (): Promise<SalesRep[]> => {
    try {
      console.log("salesRepService: Starting getAll sales reps request");
      const result = await salesRepFirestoreService.getAll();
      console.log(`salesRepService: Retrieved ${result.length} sales reps from Firestore`);
      
      // Sync to local storage for offline use
      await salesRepLocalService.setAll(result);
      
      // Log detailed information about the first few sales reps (if any)
      if (result.length > 0) {
        console.log("salesRepService: Sample sales rep data:", 
          result.slice(0, Math.min(3, result.length)).map(rep => ({
            id: rep.id,
            code: rep.code,
            name: rep.name
          }))
        );
      } else {
        console.log("salesRepService: No sales reps returned from Firestore");
      }
      
      return result;
    } catch (error) {
      console.error("Error in salesRepService.getAll:", error);
      
      // Fall back to local storage if Firebase fails
      console.log("salesRepService: Falling back to local storage");
      const localSalesReps = await salesRepLocalService.getAll();
      console.log(`salesRepService: Retrieved ${localSalesReps.length} sales reps from local storage`);
      
      return localSalesReps;
    }
  },
  
  // Get sales rep by ID
  getById: async (id: string): Promise<SalesRep | null> => {
    try {
      console.log(`salesRepService: Getting sales rep by ID: ${id}`);
      const salesRep = await salesRepFirestoreService.getById(id);
      
      if (salesRep) {
        console.log(`salesRepService: Found sales rep with ID ${id}:`, {
          id: salesRep.id,
          code: salesRep.code,
          name: salesRep.name
        });
        
        // Sync to local storage for offline use
        await salesRepLocalService.update(id, salesRep);
      } else {
        console.log(`salesRepService: No sales rep found with ID ${id}`);
      }
      
      return salesRep;
    } catch (error) {
      console.error(`Error in salesRepService.getById(${id}):`, error);
      
      // Fall back to local storage
      return salesRepLocalService.getById(id);
    }
  },
  
  // Add sales rep
  add: async (salesRep: Omit<SalesRep, 'id'>): Promise<string> => {
    try {
      console.log("salesRepService: Adding new sales rep:", {
        name: salesRep.name,
        code: salesRep.code
      });
      
      // Ensure date fields are properly set
      const salesRepWithDates = {
        ...salesRep,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Get or generate ID
      const id = await salesRepFirestoreService.add(salesRepWithDates);
      console.log(`salesRepService: Sales rep added successfully with ID: ${id}`);
      
      // Sync to local storage for offline use
      const newSalesRep = { ...salesRepWithDates, id } as SalesRep;
      await salesRepLocalService.add(newSalesRep);
      
      return id;
    } catch (error) {
      console.error("Error in salesRepService.add:", error);
      
      // If Firebase fails, try to add to local storage with a temporary UUID
      try {
        const tempId = uuidv4();
        await salesRepLocalService.add({
          ...salesRep, 
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`salesRepService: Added sales rep to local storage with temporary ID: ${tempId}`);
        return tempId;
      } catch (localError) {
        console.error("Failed to add sales rep to local storage:", localError);
        throw error; // Re-throw the original error
      }
    }
  },
  
  // Update sales rep
  update: async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
    try {
      console.log(`salesRepService: Updating sales rep ${id} with:`, salesRep);
      const updateData = {
        ...salesRep,
        updatedAt: new Date()
      };
      
      await salesRepFirestoreService.update(id, updateData);
      console.log(`salesRepService: Sales rep ${id} updated successfully`);
      
      // Sync to local storage
      await salesRepLocalService.update(id, updateData);
    } catch (error) {
      console.error(`Error in salesRepService.update(${id}):`, error);
      
      // Try to update local storage even if Firebase fails
      try {
        await salesRepLocalService.update(id, {
          ...salesRep,
          updatedAt: new Date()
        });
        console.log(`salesRepService: Updated sales rep ${id} in local storage only`);
      } catch (localError) {
        console.error("Failed to update sales rep in local storage:", localError);
      }
      
      throw error; // Re-throw the original error
    }
  },
  
  // Delete sales rep
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`salesRepService: Deleting sales rep ${id}`);
      await salesRepFirestoreService.delete(id);
      console.log(`salesRepService: Sales rep ${id} deleted successfully`);
      
      // Sync to local storage
      await salesRepLocalService.delete(id);
    } catch (error) {
      console.error(`Error in salesRepService.delete(${id}):`, error);
      
      // Try to delete from local storage even if Firebase fails
      try {
        await salesRepLocalService.delete(id);
        console.log(`salesRepService: Deleted sales rep ${id} from local storage only`);
      } catch (localError) {
        console.error("Failed to delete sales rep from local storage:", localError);
      }
      
      throw error; // Re-throw the original error
    }
  }
};

// Cache for sales rep lookups by code
const salesRepCodeCache = new Map<number, SalesRep | null>();

/**
 * Get sales rep by code
 * @param code - Sales rep code
 * @returns SalesRep or null if not found
 */
export const getSalesRepByCode = async (code: number): Promise<SalesRep | null> => {
  // Check cache first
  if (salesRepCodeCache.has(code)) {
    return salesRepCodeCache.get(code) || null;
  }

  try {
    console.log(`salesRepService: Getting sales rep by code ${code}`);
    // Try Firestore first
    const salesRep = await salesRepFirestoreService.getByCode(code);
    
    if (salesRep) {
      // Update cache
      salesRepCodeCache.set(code, salesRep);
      
      // Sync to local storage
      await salesRepLocalService.update(salesRep.id, salesRep);
      
      console.log(`salesRepService: Found sales rep with code ${code}: ${salesRep.name}`);
      return salesRep;
    }
    
    // If not found in Firestore, try local storage
    console.log(`salesRepService: Sales rep with code ${code} not found in Firestore, checking local storage`);
    const localSalesRep = await salesRepLocalService.getByCode(code);
    
    // Update cache with result (even if null)
    salesRepCodeCache.set(code, localSalesRep);
    
    return localSalesRep;
  } catch (error) {
    console.error(`Error in getSalesRepByCode(${code}):`, error);
    
    // Try local storage as fallback
    try {
      const localSalesRep = await salesRepLocalService.getByCode(code);
      
      // Update cache with local result
      salesRepCodeCache.set(code, localSalesRep);
      
      return localSalesRep;
    } catch (localError) {
      console.error(`Error getting sales rep by code ${code} from local storage:`, localError);
      
      // Cache the failure to prevent repeated lookups
      salesRepCodeCache.set(code, null);
      
      return null;
    }
  }
};

/**
 * Generate next available sales rep code
 * @returns Next available code
 */
export const generateNextSalesRepCode = async (): Promise<number> => {
  try {
    console.log("salesRepService: Generating next sales rep code");
    const nextCode = await salesRepFirestoreService.generateNextCode();
    console.log(`salesRepService: Generated next sales rep code: ${nextCode}`);
    return nextCode;
  } catch (error) {
    console.error("Error in generateNextSalesRepCode:", error);
    
    // Fall back to local storage
    try {
      const salesReps = await salesRepLocalService.getAll();
      const highestCode = salesReps.reduce(
        (max, rep) => (rep.code > max ? rep.code : max),
        0
      );
      const localNextCode = highestCode + 1;
      console.log(`salesRepService: Generated next sales rep code from local storage: ${localNextCode}`);
      return localNextCode;
    } catch (localError) {
      console.error("Failed to generate next sales rep code from local storage:", localError);
      
      // If all else fails, generate a random code
      const randomCode = Math.floor(Math.random() * 10000) + 1;
      console.log(`salesRepService: Generated random sales rep code: ${randomCode}`);
      return randomCode;
    }
  }
};

/**
 * Create a new sales rep with automatic code generation if not provided
 * @param salesRep - Sales rep data (without id)
 * @returns ID of the created sales rep
 */
export const createSalesRep = async (salesRep: Omit<SalesRep, 'id'>): Promise<string> => {
  try {
    // Ensure sales rep has a code
    let salesRepData = { ...salesRep };
    
    // If no code provided, get the next available one
    if (!salesRepData.code) {
      const nextCode = await generateNextSalesRepCode();
      salesRepData.code = nextCode;
    }
    
    // Ensure code is a number
    if (typeof salesRepData.code === 'string') {
      salesRepData.code = parseInt(salesRepData.code as string, 10);
    }
    
    // Add the sales rep using the service
    const id = await salesRepService.add(salesRepData);
    
    // Clear cache for this code
    if (salesRepData.code) {
      salesRepCodeCache.delete(salesRepData.code);
    }
    
    return id;
  } catch (error) {
    console.error("Error in createSalesRep:", error);
    throw error;
  }
};

/**
 * Update an existing sales rep
 * @param id - Sales rep ID
 * @param salesRep - Updated sales rep data
 */
export const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
  try {
    // Update using the service
    await salesRepService.update(id, salesRep);
    
    // Clear cache for this code if the code is included
    if (salesRep.code) {
      salesRepCodeCache.delete(salesRep.code);
    }
  } catch (error) {
    console.error("Error in updateSalesRep:", error);
    throw error;
  }
};
