import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/firebase/customerService';
import { toast } from '@/components/ui/use-toast';
import { customerLocalService } from '@/services/local/customerLocalService';
import { useDataLoading } from '@/context/providers/DataLoadingProvider';

// Cache key for localStorage
const CUSTOMERS_CACHE_KEY = 'app_customers_cache';
const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'app_customers_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to filter valid customers
const filterValidCustomers = (customers: Customer[]): Customer[] => {
  return customers.filter(customer => 
    customer && 
    customer.id && 
    customer.name && 
    customer.name.trim() !== ''
  );
};

// Load customers with improved caching strategy
export const loadCustomers = async (forceRefresh = false): Promise<Customer[]> => {
  try {
    console.log("Attempting to load customers with forceRefresh =", forceRefresh);
    
    // Try to get from Firebase if forcing refresh
    if (forceRefresh) {
      console.log("Force refreshing customer data from Firebase");
      try {
        const customers = await customerService.getAll();
        const validCustomers = filterValidCustomers(customers);
        
        // Update localStorage cache with fresh data from Firebase
        localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(validCustomers));
        localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        
        console.log(`Loaded ${validCustomers.length} valid customers from Firebase`);
        return validCustomers;
      } catch (error) {
        console.error("Error loading customers from Firebase:", error);
        throw error; // Let the caller handle the fallback
      }
    }
    
    // If not force refreshing, try to get from cache
    const cachedData = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
    
    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      
      // If cache is still fresh, use it
      if (now - timestamp < CACHE_MAX_AGE) {
        console.log("Using cached customer data");
        const customers = JSON.parse(cachedData) as Customer[];
        // Still filter to ensure no invalid data
        return filterValidCustomers(customers); 
      }
    }
    
    // If cache is stale or missing, try Firebase
    try {
      console.log("Getting customer data from Firebase");
      const customers = await customerService.getAll();
      const validCustomers = filterValidCustomers(customers);
      
      // Store in localStorage cache
      localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(validCustomers));
      localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
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
    const cachedData = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    if (cachedData) {
      console.log("Using expired cache as fallback due to error");
      const customers = JSON.parse(cachedData) as Customer[];
      return filterValidCustomers(customers);
    }
    
    throw error;
  }
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { clearItemCache } = useDataLoading();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      console.log("Connection status changed:", online ? "ONLINE" : "OFFLINE");
      setIsOnline(online);
      
      if (online) {
        // Refresh data when coming back online
        console.log("Coming back online - refreshing customer data");
        refreshCustomers();
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
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
  
  const generateNextCode = (): number => {
    if (customers.length === 0) return 1;
    
    const highestCode = customers.reduce(
      (max, customer) => (customer.code && customer.code > max ? customer.code : max), 
      0
    );
    
    return highestCode + 1;
  };
  
  // Aliased function name to match AppContextTypes
  const generateNextCustomerCode = generateNextCode;
  
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      // Ensure customer has a code
      if (!customer.code) {
        customer.code = generateNextCode();
      }
      
      // Ensure code is a number
      if (typeof customer.code === 'string') {
        customer.code = parseInt(customer.code as string, 10);
      }
      
      const id = await customerLocalService.add({
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const newCustomer = { ...customer, id } as Customer;
      
      // Update local state
      setCustomers(prev => [...prev, newCustomer]);
      
      // Update cache
      const cachedData = localStorage.getItem(CUSTOMERS_CACHE_KEY);
      if (cachedData) {
        const cached = JSON.parse(cachedData) as Customer[];
        cached.push(newCustomer);
        localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(cached));
        localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
      
      toast({
        title: "Cliente adicionado",
        description: "Cliente adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Houve um problema ao adicionar o cliente.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      // Apply the same data validation as in addCustomer
      if (customer.code && typeof customer.code === 'string') {
        customer.code = parseInt(customer.code as string, 10);
      }
      
      await customerLocalService.update(id, {
        ...customer,
        updatedAt: new Date()
      });
      
      // Update local state
      const updatedCustomers = customers.map(c => 
        c.id === id ? { ...c, ...customer } : c
      );
      // Filter out invalid customers after update
      setCustomers(filterValidCustomers(updatedCustomers));
      
      // Update cache
      localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(filterValidCustomers(updatedCustomers)));
      localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Houve um problema ao atualizar o cliente.",
        variant: "destructive"
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      console.log(`Deleting customer ${id}`);
      
      // Delete from Firebase first
      await customerService.delete(id);
      
      // Update local state
      const updatedCustomers = customers.filter(c => c.id !== id);
      setCustomers(updatedCustomers);
      
      // Update localStorage cache
      localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(updatedCustomers));
      localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      // Update local storage service
      await customerLocalService.delete(id);
      
      // Refresh cache to ensure consistency
      await clearItemCache('customers');
      
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Houve um problema ao excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  const refreshCustomers = async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing customers data from Firebase");
      const refreshedCustomers = await loadCustomers(true); // Force refresh from Firebase
      setCustomers(refreshedCustomers);
      console.log(`Refreshed ${refreshedCustomers.length} customers`);
      
      // Update local storage
      await customerLocalService.setAll(refreshedCustomers);
    } catch (error) {
      console.error("Error refreshing customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Return the hook methods
  return {
    customers: filterValidCustomers(customers), // Ensure we always return valid customers
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    generateNextCustomerCode,
    isLoading,
    setCustomers,
    refreshCustomers,
    isOnline
  };
};
