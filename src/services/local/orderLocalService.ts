
import { Order } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for orders
 */
class OrderLocalService extends LocalStorageService<Order> {
  constructor() {
    super('orders');
  }
  
  /**
   * Get order by code
   * @param code Order code
   * @returns Order or null if not found
   */
  async getByCode(code: number): Promise<Order | null> {
    try {
      const orders = await this.getAll();
      return orders.find(order => order.code === code) || null;
    } catch (error) {
      console.error(`Error retrieving order by code ${code}:`, error);
      return null;
    }
  }
  
  /**
   * Get highest code currently used
   * @returns Highest code number
   */
  async getHighestCode(): Promise<number> {
    const orders = await this.getAll();
    
    if (orders.length === 0) return 0;
    
    return orders.reduce(
      (max, order) => (order.code > max ? order.code : max), 
      0
    );
  }
  
  /**
   * Get orders by customer ID
   * @param customerId Customer ID
   * @returns Array of orders
   */
  async getByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const orders = await this.getAll();
      return orders.filter(order => order.customerId === customerId);
    } catch (error) {
      console.error(`Error retrieving orders for customer ${customerId}:`, error);
      return [];
    }
  }
  
  /**
   * Get orders by sales rep ID
   * @param salesRepId Sales rep ID
   * @returns Array of orders
   */
  async getBySalesRepId(salesRepId: string): Promise<Order[]> {
    try {
      const orders = await this.getAll();
      return orders.filter(order => order.salesRepId === salesRepId);
    } catch (error) {
      console.error(`Error retrieving orders for sales rep ${salesRepId}:`, error);
      return [];
    }
  }
  
  /**
   * Optimized getById method with better error handling and logging
   */
  async getById(id: string): Promise<Order | null> {
    console.log(`Fetching order with ID: ${id}`);
    try {
      const result = await super.getById(id);
      if (!result) {
        console.warn(`Order with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      console.error(`Error retrieving order by ID ${id}:`, error);
      throw new Error(`Failed to retrieve order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create a singleton instance
export const orderLocalService = new OrderLocalService();
