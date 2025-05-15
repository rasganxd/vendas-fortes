
import { Order } from '@/types';
import { LocalStorageService } from './localStorageService';
import { mockOrders } from '@/data/mock/orders';

/**
 * LocalStorage service for orders
 */
class OrderLocalService extends LocalStorageService<Order> {
  constructor() {
    super('orders');
    this.initializeWithMockData();
  }
  
  /**
   * Initialize with mock data if empty
   */
  async initializeWithMockData(): Promise<void> {
    const data = await this.getAll();
    
    if (data.length === 0) {
      console.log("Initializing orders local storage with mock data");
      await this.initializeWithDefault(mockOrders);
    }
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
}

// Create a singleton instance
export const orderLocalService = new OrderLocalService();
