
import { PaymentTable } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * PaymentTable-specific Firestore service implementation
 */
class PaymentTableFirestoreServiceClass extends FirestoreService<PaymentTable> {
  constructor() {
    super('payment_tables');
  }

  /**
   * Get payment table by name
   * @param name Table name
   * @returns PaymentTable or null if not found
   */
  async getByName(name: string): Promise<PaymentTable | null> {
    try {
      console.log(`PaymentTableFirestoreService: Getting payment table by name ${name}`);
      const tables = await this.query([where('name', '==', name)]);
      
      if (tables.length > 0) {
        console.log(`PaymentTableFirestoreService: Found payment table with name ${name}`);
        return tables[0];
      } else {
        console.log(`PaymentTableFirestoreService: No payment table found with name ${name}`);
        return null;
      }
    } catch (error) {
      console.error(`PaymentTableFirestoreService: Error getting payment table by name ${name}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const paymentTableFirestoreService = new PaymentTableFirestoreServiceClass();
