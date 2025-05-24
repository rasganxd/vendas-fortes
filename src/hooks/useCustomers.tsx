
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { toast } from '@/components/ui/use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    if (hasAttemptedLoad) return;
    
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log("Fetching customers from Supabase");
        const fetchedCustomers = await customerService.getAll();
        console.log(`Loaded ${fetchedCustomers.length} customers from Supabase`);
        
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [hasAttemptedLoad]);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const id = await customerService.add(customer);
      
      const newCustomer = { ...customer, id } as Customer;
      setCustomers((prev) => [...prev, newCustomer]);
      
      toast({
        title: 'Cliente adicionado',
        description: 'Cliente adicionado com sucesso!',
      });
      
      return id;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o cliente.',
        variant: 'destructive',
      });
      return "";
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      await customerService.update(id, customer);
      
      setCustomers((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...customer } : item))
      );
      
      toast({
        title: 'Cliente atualizado',
        description: 'Cliente atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o cliente.',
        variant: 'destructive',
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerService.delete(id);
      
      setCustomers((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Cliente excluído',
        description: 'Cliente excluído com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente.',
        variant: 'destructive',
      });
    }
  };

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};

// Export loadCustomers function for compatibility
export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Loading customers from Supabase (loadCustomers function)");
    return await customerService.getAll();
  } catch (error) {
    console.error('Error in loadCustomers:', error);
    return [];
  }
};
