
import { Customer } from '@/types';
import { customerFirestoreService } from './CustomerFirestoreService';
import { customerLocalService } from '../local/customerLocalService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for customer operations
 * Using Firebase with localStorage sync for offline support
 */
export const customerService = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    try {
      console.log("customerService: Starting getAll customers request");
      const result = await customerFirestoreService.getAll();
      console.log(`customerService: Retrieved ${result.length} customers from Firestore`);
      
      // Sync to local storage for offline use
      await customerLocalService.setAll(result);
      
      // Log detailed information about the first few customers (if any)
      if (result.length > 0) {
        console.log("customerService: Sample customer data:", 
          result.slice(0, Math.min(3, result.length)).map(customer => ({
            id: customer.id,
            code: customer.code,
            name: customer.name,
          }))
        );
      } else {
        console.log("customerService: No customers returned from Firestore");
      }
      
      return result;
    } catch (error) {
      console.error("Error in customerService.getAll:", error);
      
      // Fall back to local storage if Firebase fails
      console.log("customerService: Falling back to local storage");
      const localCustomers = await customerLocalService.getAll();
      console.log(`customerService: Retrieved ${localCustomers.length} customers from local storage`);
      
      return localCustomers;
    }
  },
  
  // Get customer by ID
  getById: async (id: string): Promise<Customer | null> => {
    try {
      console.log(`customerService: Getting customer by ID: ${id}`);
      const customer = await customerFirestoreService.getById(id);
      
      if (customer) {
        console.log(`customerService: Found customer with ID ${id}:`, {
          id: customer.id,
          code: customer.code,
          name: customer.name
        });
        
        // Sync to local storage for offline use
        await customerLocalService.update(id, customer);
      } else {
        console.log(`customerService: No customer found with ID ${id}`);
      }
      
      return customer;
    } catch (error) {
      console.error(`Error in customerService.getById(${id}):`, error);
      
      // Fall back to local storage
      return customerLocalService.getById(id);
    }
  },
  
  // Add customer
  add: async (customer: Omit<Customer, 'id'>): Promise<string> => {
    try {
      console.log("customerService: Adding new customer:", {
        name: customer.name,
        code: customer.code
      });
      
      // Ensure date fields are properly set
      const customerWithDates = {
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Get or generate ID
      const id = await customerFirestoreService.add(customerWithDates);
      console.log(`customerService: Customer added successfully with ID: ${id}`);
      
      // Sync to local storage for offline use
      const newCustomer = { ...customerWithDates, id } as Customer;
      await customerLocalService.add(newCustomer);
      
      return id;
    } catch (error) {
      console.error("Error in customerService.add:", error);
      
      // If Firebase fails, try to add to local storage with a temporary UUID
      try {
        const tempId = uuidv4();
        await customerLocalService.add({
          ...customer, 
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`customerService: Added customer to local storage with temporary ID: ${tempId}`);
        return tempId;
      } catch (localError) {
        console.error("Failed to add customer to local storage:", localError);
        throw error; // Re-throw the original error
      }
    }
  },
  
  // Update customer
  update: async (id: string, customer: Partial<Customer>): Promise<void> => {
    try {
      console.log(`customerService: Updating customer ${id} with:`, customer);
      const updateData = {
        ...customer,
        updatedAt: new Date()
      };
      
      await customerFirestoreService.update(id, updateData);
      console.log(`customerService: Customer ${id} updated successfully`);
      
      // Sync to local storage
      await customerLocalService.update(id, updateData);
    } catch (error) {
      console.error(`Error in customerService.update(${id}):`, error);
      
      // Try to update local storage even if Firebase fails
      try {
        await customerLocalService.update(id, {
          ...customer,
          updatedAt: new Date()
        });
        console.log(`customerService: Updated customer ${id} in local storage only`);
      } catch (localError) {
        console.error("Failed to update customer in local storage:", localError);
      }
      
      throw error; // Re-throw the original error
    }
  },
  
  // Delete customer
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`customerService: Deleting customer ${id}`);
      await customerFirestoreService.delete(id);
      console.log(`customerService: Customer ${id} deleted successfully`);
      
      // Sync to local storage
      await customerLocalService.delete(id);
    } catch (error) {
      console.error(`Error in customerService.delete(${id}):`, error);
      
      // Try to delete from local storage even if Firebase fails
      try {
        await customerLocalService.delete(id);
        console.log(`customerService: Deleted customer ${id} from local storage only`);
      } catch (localError) {
        console.error("Failed to delete customer from local storage:", localError);
      }
      
      throw error; // Re-throw the original error
    }
  },

  // Get customer by code
  getByCode: async (code: number): Promise<Customer | null> => {
    try {
      console.log(`customerService: Getting customer by code ${code}`);
      const customer = await customerFirestoreService.getByCode(code);
      
      if (customer) {
        console.log(`customerService: Found customer with code ${code}`);
        // Sync to local storage
        await customerLocalService.update(customer.id, customer);
      } else {
        console.log(`customerService: No customer found with code ${code}`);
      }
      
      return customer;
    } catch (error) {
      console.error(`Error in customerService.getByCode(${code}):`, error);
      
      // Fall back to local storage
      return customerLocalService.getByCode(code);
    }
  },
  
  // Generate next customer code
  generateNextCustomerCode: async (): Promise<number> => {
    try {
      console.log("customerService: Generating next customer code");
      const nextCode = await customerFirestoreService.generateNextCustomerCode();
      console.log(`customerService: Generated next customer code: ${nextCode}`);
      return nextCode;
    } catch (error) {
      console.error("Error in customerService.generateNextCustomerCode:", error);
      
      // Fall back to local storage
      try {
        const customers = await customerLocalService.getAll();
        const highestCode = customers.reduce(
          (max, customer) => (customer.code > max ? customer.code : max),
          0
        );
        const localNextCode = highestCode + 1;
        console.log(`customerService: Generated next customer code from local storage: ${localNextCode}`);
        return localNextCode;
      } catch (localError) {
        console.error("Failed to generate next customer code from local storage:", localError);
        
        // If all else fails, generate a random code
        const randomCode = Math.floor(Math.random() * 10000) + 1;
        console.log(`customerService: Generated random customer code: ${randomCode}`);
        return randomCode;
      }
    }
  }
};

/**
 * Export getCustomerByCode function for backward compatibility
 */
export const getCustomerByCode = async (code: number): Promise<Customer | null> => {
  return customerService.getByCode(code);
};
