
import { Payment } from '@/types';
import { paymentFirestoreService } from './PaymentFirestoreService';

/**
 * Service for payment operations
 * Using Firebase exclusively
 */
export const paymentService = {
  // Get all payments
  getAll: async (): Promise<Payment[]> => {
    return paymentFirestoreService.getAll();
  },
  
  // Get payment by ID
  getById: async (id: string): Promise<Payment | null> => {
    return paymentFirestoreService.getById(id);
  },
  
  // Add payment
  add: async (payment: Omit<Payment, 'id'>): Promise<string> => {
    // Ensure date fields are properly set
    const paymentWithDates = {
      ...payment,
      createdAt: payment.createdAt || new Date(),
      updatedAt: payment.updatedAt || new Date()
    };
    return paymentFirestoreService.add(paymentWithDates);
  },
  
  // Update payment
  update: async (id: string, payment: Partial<Payment>): Promise<void> => {
    const updateData = {
      ...payment,
      updatedAt: new Date()
    };
    return paymentFirestoreService.update(id, updateData);
  },
  
  // Delete payment
  delete: async (id: string): Promise<void> => {
    return paymentFirestoreService.delete(id);
  },

  // Get payments by order ID
  getByOrderId: async (orderId: string): Promise<Payment[]> => {
    return paymentFirestoreService.getByOrderId(orderId);
  },

  // Get payments by customer name
  getByCustomerName: async (customerName: string): Promise<Payment[]> => {
    return paymentFirestoreService.getByCustomerName(customerName);
  }
};
