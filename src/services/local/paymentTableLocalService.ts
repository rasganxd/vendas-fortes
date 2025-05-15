
import { PaymentTable } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for payment tables
 */
class PaymentTableLocalService extends LocalStorageService<PaymentTable> {
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
      const tables = await this.getAll();
      return tables.find(table => table.name === name) || null;
    } catch (error) {
      console.error(`Error retrieving payment table by name ${name}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const paymentTableLocalService = new PaymentTableLocalService();
