
import { PaymentTable } from '@/types';
import { paymentTableFirestoreService } from './PaymentTableFirestoreService';

/**
 * Service for payment table operations using Firebase
 */
export const paymentTableService = {
  // Get all payment tables
  getAll: async (): Promise<PaymentTable[]> => {
    return paymentTableFirestoreService.getAll();
  },
  
  // Get payment table by ID
  getById: async (id: string): Promise<PaymentTable | null> => {
    return paymentTableFirestoreService.getById(id);
  },
  
  // Get payment table by name
  getByName: async (name: string): Promise<PaymentTable | null> => {
    return paymentTableFirestoreService.getByName(name);
  },
  
  // Add payment table
  add: async (table: Omit<PaymentTable, 'id'>): Promise<string> => {
    const tableWithDates = {
      ...table,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return paymentTableFirestoreService.add(tableWithDates);
  },
  
  // Update payment table
  update: async (id: string, table: Partial<PaymentTable>): Promise<void> => {
    const updateData = {
      ...table,
      updatedAt: new Date()
    };
    return paymentTableFirestoreService.update(id, updateData);
  },
  
  // Delete payment table
  delete: async (id: string): Promise<void> => {
    return paymentTableFirestoreService.delete(id);
  }
};
