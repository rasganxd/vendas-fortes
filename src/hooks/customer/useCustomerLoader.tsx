
import { useState } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/firebase/customerService';
import { customerLocalService } from '@/services/local/customerLocalService';
import { useCustomerCache } from './useCustomerCache';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for loading customer data from various sources
 */
export const useCustomerLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { saveToCache, getFromCache, filterValidCustomers } = useCustomerCache();

  const loadCustomers = async (forceRefresh = false): Promise<Customer[]> => {
    try {
      console.log("Attempting to load customers with forceRefresh =", forceRefresh);
      
      // Try to get from Firebase if forcing refresh
      if (forceRefresh) {
        console.log("Force refreshing customer data from Firebase");
        try {
          const customers = await customerService.getAll();
          const validCustomers = saveToCache(customers);
          console.log(`Loaded ${validCustomers.length} valid customers from Firebase`);
          return validCustomers;
        } catch (error) {
          console.error("Error loading customers from Firebase:", error);
          throw error; // Let the caller handle the fallback
        }
      }
      
      // If not force refreshing, try to get from cache
      const { customers: cachedCustomers, isFresh } = getFromCache();
      
      // If cache is still fresh, use it
      if (cachedCustomers.length > 0 && isFresh) {
        console.log("Using cached customer data");
        return filterValidCustomers(cachedCustomers);
      }
      
      // If cache is stale or missing, try Firebase
      try {
        console.log("Getting customer data from Firebase");
        const customers = await customerService.getAll();
        const validCustomers = saveToCache(customers);
        
        console.log(`Loaded ${validCustomers.length} valid customers from Firebase`);
        return validCustomers;
      } catch (firebaseError) {
        console.error("Error loading customers from Firebase:", firebaseError);
        
        // If Firebase fails, try local storage
        console.log("Falling back to local storage");
        const localCustomers = await customerLocalService.getAll();
        const validLocalCustomers = filterValidCustomers(localCustomers);
        console.log(`Loaded ${validLocalCustomers.length} valid customers from local storage`);
        return validLocalCustomers;
      }
    } catch (error) {
      console.error("Error in loadCustomers:", error);
      
      // Try to use cached data even if expired as fallback
      const { customers: cachedCustomers } = getFromCache();
      if (cachedCustomers.length > 0) {
        console.log("Using expired cache as fallback due to error");
        return filterValidCustomers(cachedCustomers);
      }
      
      throw error;
    }
  };

  const refreshCustomers = async (): Promise<Customer[]> => {
    setIsLoading(true);
    try {
      console.log("Refreshing customers data from Firebase");
      const refreshedCustomers = await loadCustomers(true); // Force refresh from Firebase
      console.log(`Refreshed ${refreshedCustomers.length} customers`);
      
      // Update local storage
      await customerLocalService.setAll(refreshedCustomers);
      return refreshedCustomers;
    } catch (error) {
      console.error("Error refreshing customers:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadCustomers,
    refreshCustomers,
    isLoading,
    setIsLoading
  };
};

