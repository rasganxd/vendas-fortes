
import { SupabaseService } from './supabaseService';
import { Customer } from '@/types';
import { prepareForSupabase } from '@/utils/dataTransformers';

class CustomerSupabaseService extends SupabaseService<Customer> {
  constructor() {
    super('customers');
  }

  async generateNextCode(): Promise<number> {
    try {
      console.log("🔢 Generating next customer code...");
      const { data, error } = await this.supabase.rpc('get_next_customer_code');
      
      if (error) {
        console.error('❌ Error calling get_next_customer_code RPC:', error);
        // Fallback: get max code and add 1
        console.log("🔄 Using fallback method to generate code...");
        const allCustomers = await this.getAll();
        const maxCode = allCustomers.reduce((max, customer) => Math.max(max, customer.code || 0), 0);
        const nextCode = maxCode + 1;
        console.log("✅ Fallback generated code:", nextCode);
        return nextCode;
      }
      
      console.log("✅ RPC generated code:", data);
      return data || 1;
    } catch (error) {
      console.error('❌ Critical error generating customer code:', error);
      return 1;
    }
  }

  async add(entity: Omit<Customer, 'id'>): Promise<string> {
    try {
      console.log(`📝 Adding customer to ${this.tableName}`);
      console.log("Entity data (before transformation):", entity);
      
      // Clean and prepare data
      const cleanData = {
        code: entity.code,
        name: entity.name?.trim() || '',
        phone: entity.phone || '',
        email: entity.email || '',
        address: entity.address || '',
        city: entity.city || '',
        state: entity.state || '',
        zip_code: entity.zip || entity.zipCode || '',
        document: entity.document || '',
        notes: entity.notes || '',
        visit_days: entity.visitDays || [],
        visit_frequency: entity.visitFrequency || '',
        visit_sequence: entity.visitSequence || 0,
        sales_rep_id: entity.sales_rep_id || null,
        active: true
      };
      
      console.log("Data prepared for Supabase:", cleanData);
      
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .insert(cleanData)
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
      console.log(`✅ Added customer to ${this.tableName} with ID:`, insertedId);
      return insertedId;
    } catch (error) {
      console.error(`❌ Critical error adding to ${this.tableName}:`, error);
      throw error;
    }
  }
}

export const customerService = new CustomerSupabaseService();
