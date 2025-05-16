
import { SalesRep } from '@/types';
import { 
  salesRepService as firebaseSalesRepService,
  getSalesRepByCode as firebaseGetSalesRepByCode,
  createSalesRep as firebaseCreateSalesRep,
  updateSalesRep as firebaseUpdateSalesRep,
  generateNextSalesRepCode
} from '../firebase/salesRepService';

/**
 * Service for sales rep-related operations
 * Now using Firebase instead of local storage
 */
export const salesRepService = {
  // Get all sales reps
  getAll: async (): Promise<SalesRep[]> => {
    return firebaseSalesRepService.getAll();
  },
  
  // Get sales rep by ID
  getById: async (id: string): Promise<SalesRep | null> => {
    return firebaseSalesRepService.getById(id);
  },
  
  // Add sales rep
  add: async (salesRep: Omit<SalesRep, 'id'>): Promise<string> => {
    return firebaseCreateSalesRep(salesRep);
  },
  
  // Update sales rep
  update: async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
    return firebaseUpdateSalesRep(id, salesRep);
  },
  
  // Delete sales rep
  delete: async (id: string): Promise<void> => {
    return firebaseSalesRepService.delete(id);
  }
};

/**
 * Get sales rep by code
 * @param code - Sales rep code
 * @returns SalesRep or null if not found
 */
export const getSalesRepByCode = async (code: number): Promise<SalesRep | null> => {
  return firebaseGetSalesRepByCode(code);
};

/**
 * Create a new sales rep with automatic code generation if not provided
 * @param salesRep - Sales rep data (without id)
 * @returns ID of the created sales rep
 */
export const createSalesRep = async (salesRep: Omit<SalesRep, 'id'>): Promise<string> => {
  return firebaseCreateSalesRep(salesRep);
};

/**
 * Update an existing sales rep
 * @param id - Sales rep ID
 * @param salesRep - Updated sales rep data
 */
export const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
  return firebaseUpdateSalesRep(id, salesRep);
};
