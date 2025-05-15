
import { Customer } from '@/types';
import { customerLocalService } from '../local/customerLocalService';

/**
 * Service for customer operations
 * Now using local storage instead of Supabase
 */
export const customerService = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    return customerLocalService.getAll();
  },
  
  // Get customer by ID
  getById: async (id: string): Promise<Customer | null> => {
    return customerLocalService.getById(id);
  },
  
  // Add customer
  add: async (customer: Omit<Customer, 'id'>): Promise<string> => {
    const customerWithDates = {
      ...customer,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return customerLocalService.add(customerWithDates);
  },
  
  // Update customer
  update: async (id: string, customer: Partial<Customer>): Promise<void> => {
    const updateData = {
      ...customer,
      updatedAt: new Date()
    };
    return customerLocalService.update(id, updateData);
  },
  
  // Delete customer
  delete: async (id: string): Promise<void> => {
    return customerLocalService.delete(id);
  },

  // Get customer by code
  getByCode: async (code: number): Promise<Customer | null> => {
    return customerLocalService.getByCode(code);
  }
};

/**
 * Export getCustomerByCode function for backward compatibility
 */
export const getCustomerByCode = async (code: number): Promise<Customer | null> => {
  return customerLocalService.getByCode(code);
};
