
import { Customer } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for customers
 */
class CustomerLocalService extends LocalStorageService<Customer> {
  constructor() {
    super('customers');
  }
  
  /**
   * Get customer by code
   * @param code Customer code
   * @returns Customer or null if not found
   */
  async getByCode(code: number): Promise<Customer | null> {
    try {
      const customers = await this.getAll();
      return customers.find(customer => customer.code === code) || null;
    } catch (error) {
      console.error(`Error retrieving customer by code ${code}:`, error);
      return null;
    }
  }
  
  /**
   * Get highest code currently used
   * @returns Highest code number
   */
  async getHighestCode(): Promise<number> {
    const customers = await this.getAll();
    
    if (customers.length === 0) return 0;
    
    return customers.reduce(
      (max, customer) => (customer.code > max ? customer.code : max), 
      0
    );
  }
}

// Create a singleton instance
export const customerLocalService = new CustomerLocalService();
