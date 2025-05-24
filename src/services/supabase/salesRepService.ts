
import { SupabaseService } from './supabaseService';
import { SalesRep } from '@/types';

class SalesRepSupabaseService extends SupabaseService<SalesRep> {
  constructor() {
    super('sales_reps');
  }

  async generateNextCode(): Promise<number> {
    try {
      console.log("🔢 Generating next sales rep code...");
      const { data, error } = await this.supabase.rpc('get_next_sales_rep_code');
      
      if (error) {
        console.error('❌ Error calling get_next_sales_rep_code RPC:', error);
        // Fallback: get max code and add 1
        console.log("🔄 Using fallback method to generate code...");
        const allReps = await this.getAll();
        const maxCode = allReps.reduce((max, rep) => Math.max(max, rep.code || 0), 0);
        const nextCode = maxCode + 1;
        console.log("✅ Fallback generated code:", nextCode);
        return nextCode;
      }
      
      console.log("✅ RPC generated code:", data);
      return data || 1;
    } catch (error) {
      console.error('❌ Critical error generating sales rep code:', error);
      return 1;
    }
  }

  async add(entity: Omit<SalesRep, 'id'>): Promise<string> {
    try {
      console.log(`📝 Adding sales rep to ${this.tableName}`);
      console.log("Entity data:", entity);
      
      const dataWithTimestamps = {
        ...entity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Data with timestamps:", dataWithTimestamps);
      
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .insert(dataWithTimestamps)
        .select('id')
        .single();
      
      if (error) {
        console.error(`❌ Supabase error adding to ${this.tableName}:`, error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      const insertedId = (data as any).id;
      console.log(`✅ Added sales rep to ${this.tableName} with ID:`, insertedId);
      return insertedId;
    } catch (error) {
      console.error(`❌ Critical error adding to ${this.tableName}:`, error);
      throw error;
    }
  }
}

export const salesRepService = new SalesRepSupabaseService();
