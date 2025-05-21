
import { Customer } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * Customer-specific Firestore service implementation
 */
class CustomerFirestoreServiceClass extends FirestoreService<Customer> {
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
      console.log(`CustomerFirestoreService: Getting customer by code ${code}`);
      const customers = await this.query([where('code', '==', code)]);
      
      if (customers.length > 0) {
        console.log(`CustomerFirestoreService: Found customer with code ${code}`);
        return customers[0];
      } else {
        console.log(`CustomerFirestoreService: No customer found with code ${code}`);
        return null;
      }
    } catch (error) {
      console.error(`CustomerFirestoreService: Error getting customer by code ${code}:`, error);
      return null;
    }
  }

  /**
   * Get customers by sales rep ID
   * @param salesRepId Sales rep ID
   * @returns Array of customers
   */
  async getBySalesRepId(salesRepId: string): Promise<Customer[]> {
    try {
      console.log(`CustomerFirestoreService: Getting customers by sales rep ID ${salesRepId}`);
      const customers = await this.query([where('sales_rep_id', '==', salesRepId)]);
      console.log(`CustomerFirestoreService: Found ${customers.length} customers for sales rep ${salesRepId}`);
      return customers;
    } catch (error) {
      console.error(`CustomerFirestoreService: Error getting customers by sales rep ID ${salesRepId}:`, error);
      return [];
    }
  }

  /**
   * Generate next available customer code
   * @returns Next available code
   */
  async generateNextCustomerCode(): Promise<number> {
    try {
      console.log("CustomerFirestoreService: Generating next customer code");
      const customers = await this.getAll();
      
      if (customers.length === 0) {
        console.log("CustomerFirestoreService: No customers found, returning code 1");
        return 1;
      }
      
      const highestCode = customers.reduce(
        (max, customer) => (customer.code > max ? customer.code : max),
        0
      );
      
      const nextCode = highestCode + 1;
      console.log(`CustomerFirestoreService: Generated next customer code: ${nextCode}`);
      return nextCode;
    } catch (error) {
      console.error("CustomerFirestoreService: Error generating next customer code:", error);
      return 1;
    }
  }
}

// Create a singleton instance
export const customerFirestoreService = new CustomerFirestoreServiceClass();
