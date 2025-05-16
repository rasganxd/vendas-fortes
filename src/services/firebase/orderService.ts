
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
      console.log("orderService: Starting getAll orders request");
      const result = await orderFirestoreService.getAll();
      console.log(`orderService: Retrieved ${result.length} orders from Firestore`);
      
      // Log detailed information about the first few orders (if any)
      if (result.length > 0) {
        console.log("orderService: Sample order data:", 
          result.slice(0, Math.min(3, result.length)).map(order => ({
            id: order.id,
            code: order.code,
            customerName: order.customerName,
            total: order.total,
            createdAt: order.createdAt
          }))
        );
      } else {
        console.log("orderService: No orders returned from Firestore");
      }
      
      return result;
    } catch (error) {
      console.error("Error in orderService.getAll:", error);
      // Return empty array on error to prevent app from crashing
      return [];
    }
  },
  
  // Get order by ID
  getById: async (id: string): Promise<Order | null> => {
    try {
      console.log(`orderService: Getting order by ID: ${id}`);
      const order = await orderFirestoreService.getById(id);
      if (order) {
        console.log(`orderService: Found order with ID ${id}:`, {
          id: order.id,
          code: order.code,
          customerName: order.customerName,
          total: order.total
        });
      } else {
        console.log(`orderService: No order found with ID ${id}`);
      }
      return order;
    } catch (error) {
      console.error(`Error in orderService.getById(${id}):`, error);
      return null;
    }
  },
  
  // Add order
  add: async (order: Omit<Order, 'id'>): Promise<string> => {
    try {
      console.log("orderService: Adding new order:", {
        customer: order.customerName,
        total: order.total,
        items: order.items?.length
      });
      
      // Ensure date fields are properly set
      const orderWithDates = {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const id = await orderFirestoreService.add(orderWithDates);
      console.log(`orderService: Order added successfully with ID: ${id}`);
      return id;
    } catch (error) {
      console.error("Error in orderService.add:", error);
      throw error; // Re-throw to be handled by the caller
    }
  },
  
  // Update order
  update: async (id: string, order: Partial<Order>): Promise<void> => {
    try {
      console.log(`orderService: Updating order ${id} with:`, order);
      const updateData = {
        ...order,
        updatedAt: new Date()
      };
      await orderFirestoreService.update(id, updateData);
      console.log(`orderService: Order ${id} updated successfully`);
      return;
    } catch (error) {
      console.error(`Error in orderService.update(${id}):`, error);
      throw error; // Re-throw to be handled by the caller
    }
  },
  
  // Delete order
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`orderService: Deleting order ${id}`);
      await orderFirestoreService.delete(id);
      console.log(`orderService: Order ${id} deleted successfully`);
      return;
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
      console.log("orderService: Generating next order code");
      const nextCode = await orderFirestoreService.generateNextOrderCode();
      console.log(`orderService: Generated next order code: ${nextCode}`);
      return nextCode;
    } catch (error) {
      console.error("Error in orderService.generateNextOrderCode:", error);
      // Generate a random code if we can't get the next one
      const randomCode = Math.floor(Math.random() * 10000) + 1;
      console.log("orderService: Generated random code instead:", randomCode);
      return randomCode;
    }
  }
};
