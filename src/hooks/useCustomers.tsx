
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase';
import { toast } from '@/components/ui/use-toast';
import { transformCustomerData, transformArray, prepareForSupabase } from '@/utils/dataTransformers';

export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Loading customers from Supabase");
    const data = await customerService.getAll();
    const customers = transformArray(data, transformCustomerData) as Customer[];
    
    console.log(`Loaded ${customers.length} customers from Supabase`);
    return customers;
  } catch (error) {
    console.error("Error loading customers:", error);
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
      console.log("Adding customer to Supabase:", customer);
      
      // Ensure customer has a code
      if (!customer.code) {
        customer.code = generateNextCode();
      }
      
      // Ensure code is a number
      if (typeof customer.code === 'string') {
        customer.code = parseInt(customer.code as string, 10);
      }
      
      // Handle zip/zipCode consistency
      if (customer.zipCode && !customer.zip) {
        customer.zip = customer.zipCode;
      }
      
      // Ensure visitDays is an array
      if (!Array.isArray(customer.visitDays)) {
        customer.visitDays = customer.visitDays ? [customer.visitDays] : [];
      }
      
      // Clean document field (remove mask)
      if (customer.document) {
        customer.document = customer.document.replace(/[^\d]/g, '');
      }
      
      // Transform to Supabase format (snake_case)
      const supabaseData = prepareForSupabase(customer);
      
      const id = await customerService.add(supabaseData);
      const newCustomer = { ...customer, id } as Customer;
      
      setCustomers(prev => [...prev, newCustomer]);
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
      console.log("Updating customer in Supabase:", id, customer);
      
      // Apply the same data validation as in addCustomer
      if (customer.code && typeof customer.code === 'string') {
        customer.code = parseInt(customer.code as string, 10);
      }
      
      if (customer.zipCode && !customer.zip) {
        customer.zip = customer.zipCode;
      }
      
      if (customer.visitDays && !Array.isArray(customer.visitDays)) {
        customer.visitDays = customer.visitDays ? [customer.visitDays] : [];
      }
      
      if (customer.document) {
        customer.document = customer.document.replace(/[^\d]/g, '');
      }
      
      // Transform to Supabase format (snake_case)
      const supabaseData = prepareForSupabase(customer);
      
      await customerService.update(id, supabaseData);
      
      setCustomers(customers.map(c => 
        c.id === id ? { ...c, ...customer } : c
      ));
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
      console.log("Deleting customer from Supabase:", id);
      
      await customerService.delete(id);
      
      setCustomers(customers.filter(c => c.id !== id));
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
    setCustomers
  };
};
