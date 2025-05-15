
import { Order } from '@/types';
import { orderLocalService } from '../local/orderLocalService';

/**
 * Service for order operations
 * Now using local storage instead of Supabase
 */
export const orderService = {
  // Get all orders
  getAll: async (): Promise<Order[]> => {
    return orderLocalService.getAll();
  },
  
  // Get order by ID
  getById: async (id: string): Promise<Order | null> => {
    return orderLocalService.getById(id);
  },
  
  // Add order
  add: async (order: Omit<Order, 'id'>): Promise<string> => {
    const orderWithDates = {
      ...order,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return orderLocalService.add(orderWithDates);
  },
  
  // Update order
  update: async (id: string, order: Partial<Order>): Promise<void> => {
    const updateData = {
      ...order,
      updatedAt: new Date()
    };
    return orderLocalService.update(id, updateData);
  },
  
  // Delete order
  delete: async (id: string): Promise<void> => {
    return orderLocalService.delete(id);
  },

  // Get orders by customer ID
  getByCustomerId: async (customerId: string): Promise<Order[]> => {
    return orderLocalService.getByCustomerId(customerId);
  },

  // Get orders by sales rep ID
  getBySalesRepId: async (salesRepId: string): Promise<Order[]> => {
    return orderLocalService.getBySalesRepId(salesRepId);
  }
};
