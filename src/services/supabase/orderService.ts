
import { Order } from '@/types';
import { orderFirestoreService } from '../firebase/OrderFirestoreService';

/**
 * Service for order operations
 * Now using Firebase instead of LocalStorage
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
  }
};
