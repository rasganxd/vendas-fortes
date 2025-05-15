
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/supabase/salesRepService';
import { transformSalesRepData, transformArray } from '@/utils/dataTransformers';
import { useSalesRepsCache } from './useSalesRepsCache';
import { salesRepLocalService } from '@/services/local/salesRepLocalService';

/**
 * Service hook for sales rep data operations
 */
export const useSalesRepsService = () => {
  const { getFromCache, saveToCache, getFallbackFromCache } = useSalesRepsCache();

  /**
   * Load sales reps with caching
   * @param forceRefresh - Force refresh from storage
   * @returns Promise with sales reps array
   */
  const loadSalesReps = async (forceRefresh = false): Promise<SalesRep[]> => {
    try {
      // Try to get from cache if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getFromCache();
        if (cachedData) return cachedData;
      }
      
      console.log("Cache miss or force refresh, loading from local storage");
      
      // If not in cache or cache is stale, fetch from local storage
      const salesReps = await salesRepLocalService.getAll();
      console.log("Loaded sales reps:", salesReps);
      
      // Store in localStorage cache
      saveToCache(salesReps);
      
      return salesReps;
    } catch (error) {
      console.error("Error loading sales reps:", error);
      
      // Try to use cached data even if expired as fallback
      const fallbackData = getFallbackFromCache();
      if (fallbackData) {
        console.log("Using expired cache as fallback");
        return fallbackData;
      }
      
      throw error;
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
