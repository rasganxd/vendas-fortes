
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { toast } from '@/components/ui/use-toast';
import { transformCustomerData, transformArray } from '@/utils/dataTransformers';

// Cache key for localStorage
const CUSTOMERS_CACHE_KEY = 'app_customers_cache';
const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'app_customers_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

// Load customers with improved caching strategy
export const loadCustomers = async (forceRefresh = false): Promise<Customer[]> => {
  try {
    // Try to get from cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CUSTOMERS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // If cache is still fresh, use it
        if (now - timestamp < CACHE_MAX_AGE) {
          return JSON.parse(cachedData) as Customer[];
        }
      }
    }
    
    // If not in cache or cache is stale, fetch from API
    const data = await customerService.getAll();
    const customers = transformArray(data, transformCustomerData) as Customer[];
    
    // Store in localStorage cache
    localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(customers));
    localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    return customers;
  } catch (error) {
    console.error("Error loading customers:", error);
    
    // Try to use cached data even if expired as fallback
    const cachedData = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData) as Customer[];
    }
    
    throw error;
  }
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const loadedCustomers = await loadCustomers();
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
      
      const id = await customerService.add(customer);
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
      
      await customerService.update(id, customer);
      
      // Update local state
      const updatedCustomers = customers.map(c => 
        c.id === id ? { ...c, ...customer } : c
      );
      setCustomers(updatedCustomers);
      
      // Update cache
      localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(updatedCustomers));
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
      await customerService.delete(id);
      
      // Update local state
      const updatedCustomers = customers.filter(c => c.id !== id);
      setCustomers(updatedCustomers);
      
      // Update cache
      localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(updatedCustomers));
      localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
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

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    isLoading,
    setCustomers,
    refreshCustomers: async () => {
      setIsLoading(true);
      try {
        const refreshedCustomers = await loadCustomers(true);
        setCustomers(refreshedCustomers);
      } catch (error) {
        console.error("Error refreshing customers:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
};
