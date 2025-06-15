
import { Customer } from '@/types';

// Helper to convert date strings from IPC back to Date objects
const customerFromIpc = (ipcCustomer: any): Customer => {
  if (!ipcCustomer) return ipcCustomer;
  return {
    ...ipcCustomer,
    createdAt: new Date(ipcCustomer.createdAt),
    updatedAt: new Date(ipcCustomer.updatedAt),
  };
};

// This service acts as a client for the database operations exposed via IPC.
class CustomerIpcService {
  private get api() {
    if (!(window as any).electronAPI?.db) {
      // This fallback can be used to run the app in a web browser without Electron
      // for development or a web-version. For now, it throws an error.
      throw new Error("Electron DB API is not available.");
    }
    return (window as any).electronAPI.db;
  }

  async getAll(): Promise<Customer[]> {
    const customers = await this.api.getAllCustomers();
    return customers.map(customerFromIpc);
  }

  async add(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // The main process will handle ID and timestamps for Supabase, 
    // but we can assume the IPC function for adding will return what's needed.
    // Let's align with how `useCustomers` calls it.
    // The `addCustomer` in `useCustomers` will handle the full object creation.
    // This method might not be directly called if logic stays in useCustomers.
    // For now, let's make it a placeholder.
    console.warn("customerIpcService.add should be used with care. Business logic is in useCustomers.");
    return "";
  }
  
  async update(id: string, updates: Partial<Customer>): Promise<void> {
    return this.api.updateCustomer(id, updates);
  }

  async delete(id: string): Promise<void> {
    return this.api.deleteCustomer(id);
  }

  async getHighestCode(): Promise<number> {
    return this.api.getHighestCustomerCode();
  }

  async setAll(customers: Customer[]): Promise<void> {
    return this.api.setAllCustomers(customers);
  }
}

export const customerIpcService = new CustomerIpcService();
