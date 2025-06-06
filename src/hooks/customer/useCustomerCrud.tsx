
import { useState } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { useAppContext } from '@/hooks/useAppContext';

export const useCustomerCrud = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { customers, setCustomers } = useAppContext();

  const createCustomer = async (customerData: Omit<Customer, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newCustomerId = await customerService.add(customerData);
      // customerService.add returns a string ID, not a Customer object
      if (newCustomerId && typeof newCustomerId === 'string') {
        const newCustomer: Customer = {
          ...customerData,
          id: newCustomerId
        };
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomerId;
      } else {
        throw new Error('Invalid customer ID returned from service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    setIsLoading(true);
    setError(null);
    try {
      // customerService.update returns void, so we construct the updated customer locally
      await customerService.update(id, customerData);
      
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? { ...customer, ...customerData } : customer
      ));
      
      return { id, ...customerData } as Customer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await customerService.delete(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isLoading,
    error,
    customers
  };
};
