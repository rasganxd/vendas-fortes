
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { useDataLoading } from '@/context/providers/DataLoadingProvider';
import { useCustomerCache } from './customer/useCustomerCache';
import { useCustomerLoader } from './customer/useCustomerLoader';
import { useCustomerCrud } from './customer/useCustomerCrud';
import { useCustomerConnection } from './customer/useCustomerConnection';
import { toast } from '@/components/ui/use-toast';

/**
 * Main hook for customer management
 */
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { clearItemCache } = useDataLoading();
  const { filterValidCustomers } = useCustomerCache();
  const { loadCustomers, refreshCustomers, isLoading, setIsLoading } = useCustomerLoader();
  const { isOnline } = useCustomerConnection();
  const { 
    addCustomer: addCustomerBase, 
    updateCustomer: updateCustomerBase,
    deleteCustomer: deleteCustomerBase,
    generateNextCode,
    generateNextCustomerCode
  } = useCustomerCrud(customers, setCustomers);
  
  // Initial data loading
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const loadedCustomers = await loadCustomers(true); // Force refresh from Firebase first
        setCustomers(loadedCustomers);
      } catch (error) {
        console.error("Error loading customers:", error);
        toast({
          title: "Erro ao carregar clientes",
          description: "Houve um problema ao carregar os clientes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
  // Connection status change handling
  useEffect(() => {
    if (isOnline) {
      // Refresh data when coming back online
      console.log("Coming back online - refreshing customer data");
      refreshCustomers()
        .then(refreshedCustomers => {
          setCustomers(refreshedCustomers);
        })
        .catch(error => {
          console.error("Failed to refresh customers:", error);
        });
    }
  }, [isOnline]);

  // Enhanced delete function to clear cache
  const deleteCustomer = async (id: string) => {
    await deleteCustomerBase(id);
    // Refresh cache to ensure consistency
    await clearItemCache('customers');
  };
  
  // Return combined API
  return {
    customers: filterValidCustomers(customers), // Ensure we always return valid customers
    addCustomer: addCustomerBase,
    updateCustomer: updateCustomerBase,
    deleteCustomer,
    generateNextCode,
    generateNextCustomerCode,
    isLoading,
    setCustomers,
    refreshCustomers,
    isOnline
  };
};

