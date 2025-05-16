
import { FirestoreService } from './FirestoreService';
import { Payment } from '@/types';
import { where, query, getDocs, collection } from 'firebase/firestore';
import { db } from './config';

class PaymentFirestoreService extends FirestoreService<Payment> {
  constructor() {
    super('payments');
  }
  
  /**
   * Get payments by order ID
   * @param orderId Order ID
   * @returns Array of payments
   */
  async getByOrderId(orderId: string): Promise<Payment[]> {
    try {
      const q = query(collection(db, this.collectionName), where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as Payment;
      });
    } catch (error) {
      console.error(`Error retrieving payments for order ${orderId}:`, error);
      return [];
    }
  }
  
  /**
   * Get payments by customer name
   * @param customerName Customer name
   * @returns Array of payments
   */
  async getByCustomerName(customerName: string): Promise<Payment[]> {
    try {
      const q = query(collection(db, this.collectionName), where('customerName', '==', customerName));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as Payment;
      });
    } catch (error) {
      console.error(`Error retrieving payments for customer ${customerName}:`, error);
      return [];
    }
  }
}

// Create a singleton instance
export const paymentFirestoreService = new PaymentFirestoreService();
