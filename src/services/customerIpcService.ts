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

  async add(customer: Customer): Promise<void> {
    // The main process will handle ID and timestamps for Supabase, 
    // we pass the full customer object to be added to SQLite.
    return this.api.addCustomer(customer);
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
