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
  const [syncPending, setSyncPending] = useState<{[key: string]: Customer}>({});

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
      
      const finalCustomer = {
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // First try to save to Firebase
      let id = '';
      try {
        id = await customerService.add(finalCustomer);
        console.log("Customer saved to Firebase with ID:", id);
      } catch (firebaseError) {
        console.error("Error saving to Firebase, will save locally and sync later:", firebaseError);
        
        // If Firebase fails, save locally with a temporary ID
        id = await customerLocalService.add(finalCustomer);
        
        // Mark for sync later
        const customerWithId = { ...finalCustomer, id, syncPending: true } as Customer;
        setSyncPending(prev => ({...prev, [id]: customerWithId}));
        
        toast({
          title: "Cliente salvo localmente",
          description: "O cliente será sincronizado quando a conexão for restaurada",
          variant: "default"
        });
        
        // Return the temporary ID
        return id;
      }
      
      // If Firebase was successful, also save to local storage with the Firebase ID
      const newCustomer = { ...finalCustomer, id } as Customer;
      await customerLocalService.add(newCustomer);
      
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
      
      const updates = {
        ...customer,
        updatedAt: new Date()
      };
      
      // Try to update in Firebase first
      try {
        await customerService.update(id, updates);
        console.log("Customer updated in Firebase with ID:", id);
      } catch (firebaseError) {
        console.error("Error updating in Firebase, will update locally and sync later:", firebaseError);
        
        // Mark for sync later
        const currentCustomer = customers.find(c => c.id === id);
        if (currentCustomer) {
          const updatedCustomer = { ...currentCustomer, ...updates, syncPending: true } as Customer;
          setSyncPending(prev => ({...prev, [id]: updatedCustomer}));
        }
        
        toast({
          title: "Cliente atualizado localmente",
          description: "As alterações serão sincronizadas quando a conexão for restaurada",
          variant: "default"
        });
      }
      
      // Always update local storage
      await customerLocalService.update(id, updates);
      
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

  // Synchronize pending customers to Firebase when connection is restored
  const syncPendingCustomers = async () => {
    const pendingCustomers = Object.values(syncPending);
    if (pendingCustomers.length === 0) return;
    
    console.log(`Synchronizing ${pendingCustomers.length} pending customers to Firebase`);
    
    for (const customer of pendingCustomers) {
      try {
        const { id, syncPending, ...customerData } = customer;
        
        // Check if customer exists in Firebase
        const existingCustomer = await customerService.getById(id);
        
        if (existingCustomer) {
          // Update existing customer
          await customerService.update(id, customerData);
        } else {
          // Add as new customer
          await customerService.add(customerData);
        }
        
        // Remove from pending list
        setSyncPending(prev => {
          const newPending = {...prev};
          delete newPending[id];
          return newPending;
        });
      } catch (error) {
        console.error(`Failed to sync customer ${customer.id}:`, error);
      }
    }
  };

  return {
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    syncPendingCustomers,
    generateNextCustomerCode: generateNextCode // Alias for backward compatibility
  };
};
