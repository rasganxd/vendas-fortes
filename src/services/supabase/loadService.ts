
import { SupabaseService } from './supabaseService';
import { Load } from '@/types';

class LoadSupabaseService extends SupabaseService<Load> {
  constructor() {
    super('loads');
  }

  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_next_load_code');
      
      if (error) {
        console.error('Error generating load code:', error);
        // Fallback: get max code and add 1
        const allLoads = await this.getAll();
        const maxCode = allLoads.reduce((max, load) => Math.max(max, load.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating load code:', error);
      return 1;
    }
  }
}

export const loadService = new LoadSupabaseService();
