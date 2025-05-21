
import { useState } from 'react';
import { Customer } from '@/types';
import { customerLocalService } from '@/services/local/customerLocalService';
import { customerService } from '@/services/firebase/customerService';
import { useCustomerCache } from './useCustomerCache';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for customer CRUD operations
 */
export const useCustomerCrud = (
  customers: Customer[], 
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
) => {
  const { saveToCache, filterValidCustomers } = useCustomerCache();

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
      
      const id = await customerLocalService.add({
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const newCustomer = { ...customer, id } as Customer;
      
      // Update local state
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      
      // Update cache
      saveToCache(updatedCustomers);
      
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
      const validCustomers = filterValidCustomers(updatedCustomers);
      setCustomers(validCustomers);
      
      // Update cache
      saveToCache(validCustomers);
      
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
      saveToCache(updatedCustomers);
      
      // Update local storage service
      await customerLocalService.delete(id);
      
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
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    generateNextCustomerCode: generateNextCode // Alias for backward compatibility
  };
};

