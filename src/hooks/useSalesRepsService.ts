
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/supabase/salesRepService';
import { salesRepLocalService } from '@/services/local/salesRepLocalService';

/**
 * Service hook for sales rep data operations
 */
export const useSalesRepsService = () => {
  /**
   * Load sales reps with caching
   * @param forceRefresh - Force refresh from storage
   * @returns Promise with sales reps array
   */
  const loadSalesReps = async (forceRefresh = false): Promise<SalesRep[]> => {
    try {
      // If forcing refresh, go directly to Supabase
      if (forceRefresh) {
        console.log("Forcing refresh from Supabase");
        const supabaseSalesReps = await salesRepService.getAll();
        
        // Update local storage with new data
        await salesRepLocalService.setAll(supabaseSalesReps);
        
        return supabaseSalesReps;
      }
      
      console.log("Loading from Supabase and falling back to local if needed");
      
      // Try to load from Supabase first
      try {
        const supabaseSalesReps = await salesRepService.getAll();
        
        // Update local storage with new data for offline use
        await salesRepLocalService.setAll(supabaseSalesReps);
        
        return supabaseSalesReps;
      } catch (error) {
        console.error("Error loading sales reps from Supabase:", error);
        
        // Fall back to local storage
        console.log("Falling back to local storage");
        const localSalesReps = await salesRepLocalService.getAll();
        console.log(`Loaded ${localSalesReps.length} sales reps from local storage`);
        
        return localSalesReps;
      }
    } catch (error) {
      console.error("Error loading sales reps:", error);
      
      // Try local storage as final fallback
      try {
        const localSalesReps = await salesRepLocalService.getAll();
        return localSalesReps;
      } catch (localError) {
        console.error("Error loading from local storage:", localError);
        return [];
      }
    }
  };

  /**
   * Generate next sequential code for sales rep
   * @param salesReps - Current sales reps array
   * @returns Next available code number
   */
  const generateNextCode = (salesReps: SalesRep[]): number => {
    if (salesReps.length === 0) return 1;
    
    const highestCode = salesReps.reduce(
      (max, rep) => (rep.code && rep.code > max ? rep.code : max), 
      0
    );
    
    return highestCode + 1;
  };

  return {
    loadSalesReps,
    generateNextCode
  };
};
