
import { SupabaseService } from './supabaseService';
import { Order } from '@/types';

class OrderSupabaseService extends SupabaseService<Order> {
  constructor() {
    super('orders');
  }

  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_next_order_code');
      
      if (error) {
        console.error('Error generating order code:', error);
        // Fallback: get max code and add 1
        const allOrders = await this.getAll();
        const maxCode = allOrders.reduce((max, order) => Math.max(max, order.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating order code:', error);
      return 1;
    }
  }
}

export const orderService = new OrderSupabaseService();
