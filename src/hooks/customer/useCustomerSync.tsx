
import { useState } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/firebase/customerService';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for synchronizing customers between local storage and Firebase
 */
export const useCustomerSync = () => {
  const [syncPending, setSyncPending] = useState<{[key: string]: Customer}>({});

  const addToPendingSync = (customer: Customer) => {
    setSyncPending(prev => ({...prev, [customer.id]: customer}));
  };

  const removeFromPendingSync = (id: string) => {
    setSyncPending(prev => {
      const newPending = {...prev};
      delete newPending[id];
      return newPending;
    });
  };

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
        removeFromPendingSync(id);
      } catch (error) {
        console.error(`Failed to sync customer ${customer.id}:`, error);
      }
    }
  };

  return {
    syncPending,
    addToPendingSync,
    removeFromPendingSync,
    syncPendingCustomers,
    getPendingCount: () => Object.keys(syncPending).length
  };
};
