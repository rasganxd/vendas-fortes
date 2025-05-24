
import { SupabaseService } from './supabaseService';
import { SalesRep } from '@/types';

class SalesRepSupabaseService extends SupabaseService<SalesRep> {
  constructor() {
    super('sales_reps');
  }

  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_next_sales_rep_code');
      
      if (error) {
        console.error('Error generating sales rep code:', error);
        // Fallback: get max code and add 1
        const allReps = await this.getAll();
        const maxCode = allReps.reduce((max, rep) => Math.max(max, rep.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating sales rep code:', error);
      return 1;
    }
  }
}

export const salesRepService = new SalesRepSupabaseService();
