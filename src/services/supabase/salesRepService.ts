
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData, prepareForSupabase } from '@/utils/dataTransformers';
import { SalesRep } from '@/types';

/**
 * Service for sales rep-related operations
 */
export const salesRepService = createStandardService('sales_reps');

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
    const { data, error } = await supabase
      .from('sales_reps')
      .select('*')
      .eq('code', code)
      .single();
      
    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error("Error fetching sales rep by code:", error);
      }
      salesRepCodeCache.set(code, null);
      return null;
    }
    
    const salesRep = transformSalesRepData(data);
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
      const { data: lastSalesRep } = await supabase
        .from('sales_reps')
        .select('code')
        .order('code', { ascending: false })
        .limit(1)
        .single();
      
      salesRepData.code = (lastSalesRep?.code || 0) + 1;
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
    
    // Prepare for Supabase - convert to snake_case and handle dates
    const supabaseData = prepareForSupabase(salesRepData);
    
    console.log("Data prepared for Supabase:", supabaseData);
    
    // Validate required fields after transformation
    if (typeof supabaseData.name !== 'string' || !supabaseData.name) {
      throw new Error("Sales rep name is missing or invalid after transformation");
    }
    
    if (supabaseData.code !== undefined && typeof supabaseData.code !== 'number') {
      if (typeof supabaseData.code === 'string' && !isNaN(parseInt(supabaseData.code as string, 10))) {
        supabaseData.code = parseInt(supabaseData.code as string, 10);
      } else {
        throw new Error("Sales rep code must be a number");
      }
    }
    
    // Create a properly typed object for Supabase insert
    // This ensures we match the exact type expected by Supabase
    const insertData = {
      name: supabaseData.name as string,
      code: supabaseData.code as number,
      email: supabaseData.email as string | null,
      phone: supabaseData.phone as string | null,
      document: supabaseData.document as string | null,
      address: supabaseData.address as string | null,
      city: supabaseData.city as string | null,
      state: supabaseData.state as string | null,
      zip: supabaseData.zip as string | null,
      notes: supabaseData.notes as string | null,
      role: supabaseData.role as string | null || 'sales',
      active: supabaseData.active !== false, // Default to true if not explicitly false
      region: supabaseData.region as string | null,
      created_at: supabaseData.created_at as string | null || new Date().toISOString(),
      updated_at: supabaseData.updated_at as string | null || new Date().toISOString()
    };
    
    console.log("Typed data for insert:", insertData);
    
    const { data, error } = await supabase
      .from('sales_reps')
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating sales rep:", error);
      throw error;
    }
    
    // Clear cache for this code
    if (salesRepData.code) {
      salesRepCodeCache.delete(salesRepData.code);
    }
    
    return data.id;
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
    
    // Prepare data for Supabase
    const supabaseData = prepareForSupabase(salesRep);
    
    console.log("Data prepared for Supabase update:", supabaseData);
    
    const { error } = await supabase
      .from('sales_reps')
      .update(supabaseData)
      .eq('id', id);
      
    if (error) {
      console.error("Error updating sales rep:", error);
      throw error;
    }
    
    // Clear cache for this code if the code is included
    if (salesRep.code) {
      salesRepCodeCache.delete(salesRep.code);
    }
  } catch (error) {
    console.error("Error in updateSalesRep:", error);
    throw error;
  }
};
