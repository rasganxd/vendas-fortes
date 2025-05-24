
import { SupabaseService } from './supabaseService';
import { Customer } from '@/types';

class CustomerSupabaseService extends SupabaseService<Customer> {
  constructor() {
    super('customers');
  }

  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_next_customer_code');
      
      if (error) {
        console.error('Error generating customer code:', error);
        // Fallback: get max code and add 1
        const allCustomers = await this.getAll();
        const maxCode = allCustomers.reduce((max, customer) => Math.max(max, customer.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating customer code:', error);
      return 1;
    }
  }
}

export const customerService = new CustomerSupabaseService();
