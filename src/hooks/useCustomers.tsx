
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/firebase/customerService';
import { customerLocalService } from '@/services/local/customerLocalService';

// Cache keys
const CUSTOMERS_CACHE_KEY = 'app_customers_cache';
const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'app_customers_timestamp';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await customerService.getAll();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
        try {
          // Try to load from local storage as fallback
          const localData = await customerLocalService.getAll();
          setCustomers(localData);
        } catch (localError) {
          console.error('Error loading customers from local storage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const clearCache = async () => {
    try {
      localStorage.removeItem(CUSTOMERS_CACHE_KEY);
      localStorage.removeItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
      await customerLocalService.clearAll();
      
      // Fetch fresh data
      const freshCustomers = await customerService.getAll();
      setCustomers(freshCustomers);
      
      return true;
    } catch (error) {
      console.error("Error clearing customers cache:", error);
      return false;
    }
  };

  return {
    customers,
    isLoading,
    clearCache,
    setCustomers
  };
};

export default useCustomers;
