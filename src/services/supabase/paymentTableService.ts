
import { PaymentTable } from '@/types';
import { paymentTableLocalService } from '../local/paymentTableLocalService';

/**
 * Service for payment table operations
 * Using local storage instead of Supabase
 */
export const paymentTableService = {
  // Get all payment tables
  getAll: async (): Promise<PaymentTable[]> => {
    return paymentTableLocalService.getAll();
  },
  
  // Get payment table by ID
  getById: async (id: string): Promise<PaymentTable | null> => {
    return paymentTableLocalService.getById(id);
  },
  
  // Get payment table by name
  getByName: async (name: string): Promise<PaymentTable | null> => {
    return paymentTableLocalService.getByName(name);
  },
  
  // Add payment table
  add: async (table: Omit<PaymentTable, 'id'>): Promise<string> => {
    const tableWithDates = {
      ...table,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return paymentTableLocalService.add(tableWithDates);
  },
  
  // Update payment table
  update: async (id: string, table: Partial<PaymentTable>): Promise<void> => {
    const updateData = {
      ...table,
      updatedAt: new Date()
    };
    return paymentTableLocalService.update(id, updateData);
  },
  
  // Delete payment table
  delete: async (id: string): Promise<void> => {
    return paymentTableLocalService.delete(id);
  }
};
