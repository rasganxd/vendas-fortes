import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData } from '@/utils/dataTransformers';
import type { SalesRep } from '@/types';

/**
 * Sync service for sales reps
 */
export const syncService = {
  /**
   * Get all sales reps
   * @returns Array of SalesRep
   */
  getAllSalesReps: async (): Promise<SalesRep[]> => {
    try {
      const { data, error } = await supabase
        .from('sales_reps')
        .select('*');

      if (error) {
        console.error("Error fetching sales reps:", error);
        throw error;
      }

      return data.map(transformSalesRepData);
    } catch (error) {
      console.error("Error in getAllSalesReps:", error);
      return [];
    }
  },

  /**
   * Sync a sales rep by ID
   * @param id - Sales rep ID
   * @returns SalesRep
   */
  syncSalesRepById: async (id: string): Promise<SalesRep | null> => {
    try {
      const { data, error } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching sales rep by ID:", error);
        return null;
      }

      return transformSalesRepData(data);
    } catch (error) {
      console.error("Error in syncSalesRepById:", error);
      return null;
    }
  },

  /**
   * Sync multiple sales reps
   * @param salesReps - Array of SalesRep
   * @returns Promise<void>
   */
  syncSalesReps: async (salesReps: SalesRep[]): Promise<void> => {
    try {
      const { error } = await supabase
        .from('sales_reps')
        .upsert(salesReps);

      if (error) {
        console.error("Error syncing sales reps:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in syncSalesReps:", error);
    }
  }
};
