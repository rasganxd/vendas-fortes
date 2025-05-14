
import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData } from '@/utils/dataTransformers';
import type { SalesRep } from '@/types';

/**
 * Definition of the SyncLogEntry type
 */
export interface SyncLogEntry {
  id: string;
  event_type: 'upload' | 'download' | 'error';
  device_id: string;
  sales_rep_id: string;
  created_at: string;
  details?: any;
}

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
  },

  /**
   * Get sync logs for a sales rep
   * @param salesRepId - Sales rep ID
   * @returns Array of SyncLogEntry
   */
  getSyncLogs: async (salesRepId: string): Promise<SyncLogEntry[]> => {
    try {
      // Try to use the Supabase RPC function first
      const { data, error } = await supabase
        .rpc('get_sync_logs', { p_sales_rep_id: salesRepId });
      
      if (error) {
        console.error("Error fetching sync logs:", error);
        
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('sync_logs')
          .select('*')
          .eq('sales_rep_id', salesRepId)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (fallbackError) throw fallbackError;
        
        return fallbackData as SyncLogEntry[];
      }
      
      return data as SyncLogEntry[];
    } catch (error) {
      console.error("Error in getSyncLogs:", error);
      return [];
    }
  }
};
