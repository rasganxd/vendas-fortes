
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';

export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Loading customers from Supabase");
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Transform data to match Customer type
    const customers: Customer[] = data.map(customer => ({
      id: customer.id,
      code: customer.code,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      document: customer.document || '',
      notes: customer.notes || '',
      visitFrequency: customer.visit_frequency || '',
      visitDays: customer.visit_days || [],
      visitSequence: customer.visit_sequence || 0
    }));
    
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
        // Keep existing fallback logic
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
      
      if (!customer.code) {
        customer.code = generateNextCode();
      }
      
      const id = await customerService.add(customer);
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
      
      await customerService.update(id, customer);
      
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

import { supabase } from '@/integrations/supabase/client';
