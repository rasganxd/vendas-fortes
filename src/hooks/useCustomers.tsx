
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { toast } from '@/components/ui/use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await customerService.getAll();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: "Houve um problema ao carregar os clientes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const id = await customerService.add(customer);
      const newCustomer = { ...customer, id };
      setCustomers([...customers, newCustomer]);
      
      toast({
        title: "Cliente adicionado",
        description: "Cliente adicionado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error('Error adding customer:', error);
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
      await customerService.update(id, customer);
      setCustomers(customers.map(c => c.id === id ? { ...c, ...customer } : c));
      
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Error updating customer:', error);
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
      setCustomers(customers.filter(c => c.id !== id));
      
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Houve um problema ao excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  const generateNextCustomerCode = async (): Promise<number> => {
    try {
      return await customerService.generateNextCode();
    } catch (error) {
      console.error('Error generating customer code:', error);
      return customers.length > 0 ? Math.max(...customers.map(c => c.code || 0)) + 1 : 1;
    }
  };

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  };
};

// Export function for backward compatibility
export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    return await customerService.getAll();
  } catch (error) {
    console.error('Error loading customers:', error);
    return [];
  }
};
