
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData, prepareForSupabase } from '@/utils/dataTransformers';
import { SalesRep } from '@/types';

/**
 * Service for sales rep-related operations
 */
export const salesRepService = createStandardService('sales_reps');

/**
 * Get sales rep by code
 * @param code - Sales rep code
 * @returns SalesRep or null if not found
 */
export const getSalesRepByCode = async (code: number): Promise<SalesRep | null> => {
  try {
    const { data, error } = await supabase
      .from('sales_reps')
      .select('*')
      .eq('code', code)
      .single();
      
    if (error) {
      console.error("Error fetching sales rep by code:", error);
      return null;
    }
    
    return transformSalesRepData(data);
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
    
    // Convert to snake_case and prepare for Supabase
    const supabaseData = prepareForSupabase(salesRepData);
    
    const { data, error } = await supabase
      .from('sales_reps')
      .insert(supabaseData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating sales rep:", error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in createSalesRep:", error);
    throw error;
  }
};
