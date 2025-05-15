
import { SalesRep } from '@/types';

// Cache key constants for localStorage
const SALES_REPS_CACHE_KEY = 'app_sales_reps_cache';
const SALES_REPS_CACHE_TIMESTAMP_KEY = 'app_sales_reps_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook for managing sales reps cache operations
 */
export const useSalesRepsCache = () => {
  /**
   * Get sales reps from cache if available and fresh
   * @returns Cached sales reps or null if cache is stale or missing
   */
  const getFromCache = (): SalesRep[] | null => {
    try {
      const cachedData = localStorage.getItem(SALES_REPS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(SALES_REPS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // If cache is still fresh, use it
        if (now - timestamp < CACHE_MAX_AGE) {
          return JSON.parse(cachedData) as SalesRep[];
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  /**
   * Store sales reps in cache
   * @param salesReps - Sales reps array to cache
   */
  const saveToCache = (salesReps: SalesRep[]): void => {
    try {
      localStorage.setItem(SALES_REPS_CACHE_KEY, JSON.stringify(salesReps));
      localStorage.setItem(SALES_REPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  /**
   * Get fallback data from cache even if expired
   * @returns Cached sales reps or null if missing
   */
  const getFallbackFromCache = (): SalesRep[] | null => {
    try {
      const cachedData = localStorage.getItem(SALES_REPS_CACHE_KEY);
      return cachedData ? JSON.parse(cachedData) as SalesRep[] : null;
    } catch (error) {
      console.error("Error reading fallback from cache:", error);
      return null;
    }
  };

  /**
   * Update a specific sales rep in cache
   * @param updatedSalesReps - Updated sales reps array
   */
  const updateCache = (updatedSalesReps: SalesRep[]): void => {
    saveToCache(updatedSalesReps);
  };

  return {
    getFromCache,
    saveToCache,
    getFallbackFromCache,
    updateCache
  };
};
