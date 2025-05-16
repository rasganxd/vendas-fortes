
import { Customer } from '@/types';
import { customerService as firebaseCustomerService } from '../firebase/customerService';

/**
 * Service for customer operations
 * Now using Firebase instead of local storage
 */
export const customerService = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    return firebaseCustomerService.getAll();
  },
  
  // Get customer by ID
  getById: async (id: string): Promise<Customer | null> => {
    return firebaseCustomerService.getById(id);
  },
  
  // Add customer
  add: async (customer: Omit<Customer, 'id'>): Promise<string> => {
    return firebaseCustomerService.add(customer);
  },
  
  // Update customer
  update: async (id: string, customer: Partial<Customer>): Promise<void> => {
    return firebaseCustomerService.update(id, customer);
  },
  
  // Delete customer
  delete: async (id: string): Promise<void> => {
    return firebaseCustomerService.delete(id);
  },

  // Get customer by code
  getByCode: async (code: number): Promise<Customer | null> => {
    return firebaseCustomerService.getByCode(code);
  },

  // Generate next customer code
  generateNextCustomerCode: async (): Promise<number> => {
    return firebaseCustomerService.generateNextCustomerCode();
  }
};

/**
 * Export getCustomerByCode function for backward compatibility
 */
export const getCustomerByCode = async (code: number): Promise<Customer | null> => {
  return firebaseCustomerService.getByCode(code);
};
