
import { Order } from '@/types';
import { orderFirestoreService } from './OrderFirestoreService';

/**
 * Service for order operations
 * Using Firebase exclusively
 */
export const orderService = {
  // Get all orders
  getAll: async (): Promise<Order[]> => {
    try {
      return await orderFirestoreService.getAll();
    } catch (error) {
      console.error("Error in orderService.getAll:", error);
      // Return empty array on error to prevent app from crashing
      return [];
    }
  },
  
  // Get order by ID
  getById: async (id: string): Promise<Order | null> => {
    try {
      return await orderFirestoreService.getById(id);
    } catch (error) {
      console.error(`Error in orderService.getById(${id}):`, error);
      return null;
    }
  },
  
  // Add order
  add: async (order: Omit<Order, 'id'>): Promise<string> => {
    try {
      // Ensure date fields are properly set
      const orderWithDates = {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return await orderFirestoreService.add(orderWithDates);
    } catch (error) {
      console.error("Error in orderService.add:", error);
      throw error; // Re-throw to be handled by the caller
    }
  },
  
  // Update order
  update: async (id: string, order: Partial<Order>): Promise<void> => {
    try {
      const updateData = {
        ...order,
        updatedAt: new Date()
      };
      return await orderFirestoreService.update(id, updateData);
    } catch (error) {
      console.error(`Error in orderService.update(${id}):`, error);
      throw error; // Re-throw to be handled by the caller
    }
  },
  
  // Delete order
  delete: async (id: string): Promise<void> => {
    try {
      return await orderFirestoreService.delete(id);
    } catch (error) {
      console.error(`Error in orderService.delete(${id}):`, error);
      throw error; // Re-throw to be handled by the caller
    }
  },

  // Get orders by customer ID
  getByCustomerId: async (customerId: string): Promise<Order[]> => {
    try {
      return await orderFirestoreService.getByCustomerId(customerId);
    } catch (error) {
      console.error(`Error in orderService.getByCustomerId(${customerId}):`, error);
      return [];
    }
  },

  // Get orders by sales rep ID
  getBySalesRepId: async (salesRepId: string): Promise<Order[]> => {
    try {
      return await orderFirestoreService.getBySalesRepId(salesRepId);
    } catch (error) {
      console.error(`Error in orderService.getBySalesRepId(${salesRepId}):`, error);
      return [];
    }
  },

  // Get order by code
  getByCode: async (code: number): Promise<Order | null> => {
    try {
      return await orderFirestoreService.getByCode(code);
    } catch (error) {
      console.error(`Error in orderService.getByCode(${code}):`, error);
      return null;
    }
  },

  // Generate next order code
  generateNextOrderCode: async (): Promise<number> => {
    try {
      return await orderFirestoreService.generateNextOrderCode();
    } catch (error) {
      console.error("Error in orderService.generateNextOrderCode:", error);
      // Generate a random code if we can't get the next one
      const randomCode = Math.floor(Math.random() * 10000) + 1;
      console.log("Generated random code instead:", randomCode);
      return randomCode;
    }
  }
};
