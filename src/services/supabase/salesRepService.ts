
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData, prepareForSupabase } from '@/utils/dataTransformers';
import { SalesRep } from '@/types';
import { TableInsert, TableUpdate } from './types';
import { salesRepLocalService } from '../local/salesRepLocalService';

/**
 * Service for sales rep-related operations
 * Now using local storage instead of Supabase
 */
export const salesRepService = {
  // Get all sales reps
  getAll: async (): Promise<SalesRep[]> => {
    return salesRepLocalService.getAll();
  },
  
  // Get sales rep by ID
  getById: async (id: string): Promise<SalesRep | null> => {
    return salesRepLocalService.getById(id);
  },
  
  // Add sales rep
  add: async (salesRep: Omit<SalesRep, 'id'>): Promise<string> => {
    return createSalesRep(salesRep);
  },
  
  // Update sales rep
  update: async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
    return updateSalesRep(id, salesRep);
  },
  
  // Delete sales rep
  delete: async (id: string): Promise<void> => {
    return salesRepLocalService.delete(id);
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
    // Use local storage service instead of Supabase
    const salesRep = await salesRepLocalService.getByCode(code);
    
    salesRepCodeCache.set(code, salesRep);
    return salesRep;
  } catch (error) {
    console.error("Error in getSalesRepByCode:", error);
    return null;
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
      const highestCode = await salesRepLocalService.getHighestCode();
      salesRepData.code = highestCode + 1;
    }
    
    // Ensure code is a number
    if (typeof salesRepData.code === 'string') {
      salesRepData.code = parseInt(salesRepData.code, 10);
    }
    
    // Ensure sales rep has required fields
    if (!salesRepData.name) {
      throw new Error("Sales rep name is required");
    }
    
    console.log("Creating sales rep with data:", salesRepData);
    
    // Use local storage instead of Supabase
    const id = await salesRepLocalService.add({
      ...salesRepData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
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
    console.log("Updating sales rep with data:", salesRep);
    
    // Use local storage instead of Supabase
    await salesRepLocalService.update(id, {
      ...salesRep,
      updatedAt: new Date()
    });
    
    // Clear cache for this code if the code is included
    if (salesRep.code) {
      salesRepCodeCache.delete(salesRep.code);
    }
  } catch (error) {
    console.error("Error in updateSalesRep:", error);
    throw error;
  }
};
