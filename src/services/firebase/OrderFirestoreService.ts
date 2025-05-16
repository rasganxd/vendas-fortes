
import { FirestoreService, FirestoreEntity } from './FirestoreService';
import { Order } from '@/types';
import { where, query, getDocs, collection } from 'firebase/firestore';
import { db } from './config';

// Ensure Order implements FirestoreEntity
class OrderFirestoreService extends FirestoreService<Order> {
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
      const q = query(collection(db, this.collectionName), where('code', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as Order;
      }
      
      return null;
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
      const q = query(collection(db, this.collectionName), where('customerId', '==', customerId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as Order;
      });
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
      const q = query(collection(db, this.collectionName), where('salesRepId', '==', salesRepId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as Order;
      });
    } catch (error) {
      console.error(`Error retrieving orders for sales rep ${salesRepId}:`, error);
      return [];
    }
  }

  /**
   * Generate next available order code
   * @returns Next available order code
   */
  async generateNextOrderCode(): Promise<number> {
    const highestCode = await this.getHighestCode();
    return highestCode + 1;
  }
}

// Create a singleton instance
export const orderFirestoreService = new OrderFirestoreService();
