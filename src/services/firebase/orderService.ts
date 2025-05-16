
import { Order } from '@/types';
import { orderFirestoreService } from './OrderFirestoreService';

/**
 * Service for order operations
 * Using Firebase exclusively
 */
export const orderService = {
  // Get all orders
  getAll: async (): Promise<Order[]> => {
    return orderFirestoreService.getAll();
  },
  
  // Get order by ID
  getById: async (id: string): Promise<Order | null> => {
    return orderFirestoreService.getById(id);
  },
  
  // Add order
  add: async (order: Omit<Order, 'id'>): Promise<string> => {
    // Ensure date fields are properly set
    const orderWithDates = {
      ...order,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return orderFirestoreService.add(orderWithDates);
  },
  
  // Update order
  update: async (id: string, order: Partial<Order>): Promise<void> => {
    const updateData = {
      ...order,
      updatedAt: new Date()
    };
    return orderFirestoreService.update(id, updateData);
  },
  
  // Delete order
  delete: async (id: string): Promise<void> => {
    return orderFirestoreService.delete(id);
  },

  // Get orders by customer ID
  getByCustomerId: async (customerId: string): Promise<Order[]> => {
    return orderFirestoreService.getByCustomerId(customerId);
  },

  // Get orders by sales rep ID
  getBySalesRepId: async (salesRepId: string): Promise<Order[]> => {
    return orderFirestoreService.getBySalesRepId(salesRepId);
  },

  // Get order by code
  getByCode: async (code: number): Promise<Order | null> => {
    return orderFirestoreService.getByCode(code);
  },

  // Generate next order code
  generateNextOrderCode: async (): Promise<number> => {
    return orderFirestoreService.generateNextOrderCode();
  }
};
