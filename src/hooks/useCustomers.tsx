
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/firebase/customerService';
import { customerLocalService } from '@/services/local/customerLocalService';
import { useCustomerCrud } from './customer/useCustomerCrud';
import { useCustomerLoader } from './customer/useCustomerLoader';

// Cache keys
const CUSTOMERS_CACHE_KEY = 'app_customers_cache';
const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'app_customers_timestamp';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Use customer loader for loading functionality
  const { loadCustomers, refreshCustomers } = useCustomerLoader();
  
  // Use customer CRUD operations
  const { addCustomer, updateCustomer, deleteCustomer, generateNextCode } = 
    useCustomerCrud(customers, setCustomers);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await loadCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const clearCache = async () => {
    try {
      localStorage.removeItem(CUSTOMERS_CACHE_KEY);
      localStorage.removeItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
      await localStorage.removeItem('app_customers'); // Use this instead of clearAll
      
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
    setCustomers,
    // Export CRUD operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    generateNextCustomerCode: generateNextCode // Alias for backward compatibility
  };
};

// Export standalone function for loading customers
export const loadCustomers = async (forceRefresh = false): Promise<Customer[]> => {
  try {
    if (forceRefresh) {
      return await customerService.getAll();
    }
    
    // Try to get from local storage if not forcing refresh
    try {
      const localCustomers = await customerLocalService.getAll();
      if (localCustomers.length > 0) {
        return localCustomers;
      }
    } catch (localError) {
      console.error("Error loading from local storage:", localError);
    }
    
    // Fall back to Firebase
    return await customerService.getAll();
  } catch (error) {
    console.error("Error loading customers:", error);
    return [];
  }
};

export default useCustomers;
