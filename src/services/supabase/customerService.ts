
import { SupabaseService } from './supabaseService';
import { Customer } from '@/types';

class CustomerSupabaseService extends SupabaseService<Customer> {
  constructor() {
    super('customers');
  }

  // Override the transformFromDB method to map database fields to TypeScript interface
  protected transformFromDB(dbRecord: any): Customer {
    if (!dbRecord) return dbRecord;
    
    const baseTransformed = super.transformFromDB(dbRecord);
    
    // Map database snake_case fields to TypeScript camelCase
    return {
      ...baseTransformed,
      companyName: dbRecord.company_name || '',
      visitDays: dbRecord.visit_days || [],
      visitFrequency: dbRecord.visit_frequency || '',
      visitSequence: dbRecord.visit_sequence || 0,
      salesRepId: dbRecord.sales_rep_id || undefined,
      salesRepName: dbRecord.sales_rep_name || undefined,
      deliveryRouteId: dbRecord.delivery_route_id || undefined,
      zipCode: dbRecord.zip_code || '',
      // Ensure zip is set from zip_code for consistency
      zip: dbRecord.zip_code || dbRecord.zip || ''
    };
  }

  // Override the transformToDB method to map TypeScript interface to database fields
  protected transformToDB(record: Partial<Customer>): any {
    if (!record) return record;
    
    const baseTransformed = super.transformToDB(record);
    
    // Map TypeScript camelCase fields to database snake_case
    const dbRecord = {
      ...baseTransformed,
      company_name: record.companyName || '',
      visit_days: record.visitDays || [],
      visit_frequency: record.visitFrequency || '',
      visit_sequence: record.visitSequence || 0,
      sales_rep_id: record.salesRepId || null,
      sales_rep_name: record.salesRepName || null,
      delivery_route_id: record.deliveryRouteId || null,
      zip_code: record.zip || record.zipCode || ''
    };

    // Remove the camelCase fields that don't exist in the database
    delete dbRecord.companyName;
    delete dbRecord.visitDays;
    delete dbRecord.visitFrequency;
    delete dbRecord.visitSequence;
    delete dbRecord.salesRepId;
    delete dbRecord.salesRepName;
    delete dbRecord.deliveryRouteId;
    delete dbRecord.zipCode;
    delete dbRecord.zip;
    delete dbRecord.syncPending;
    
    console.log("📝 Transform to DB result:", dbRecord);
    return dbRecord;
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
      
      // Use the parent transformToDB method to properly map fields
      const transformedData = this.transformToDB(entity as Customer);
      
      const dataWithTimestamps = {
        ...transformedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true
      };
      
      console.log("Data prepared for Supabase:", dataWithTimestamps);
      
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
      console.log(`✅ Added customer to ${this.tableName} with ID:`, insertedId);
      return insertedId;
    } catch (error) {
      console.error(`❌ Critical error adding to ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<Customer>): Promise<void> {
    try {
      console.log(`📝 Updating customer ${id} in ${this.tableName}`);
      console.log("Entity data (before transformation):", entity);
      
      // Use the transformToDB method to properly map fields
      const transformedData = this.transformToDB(entity as Customer);
      
      const dataWithTimestamp = {
        ...transformedData,
        updated_at: new Date().toISOString()
      };
      
      console.log("Data prepared for Supabase update:", dataWithTimestamp);
      
      const { error } = await this.supabase
        .from(this.tableName as any)
        .update(dataWithTimestamp)
        .eq('id', id);
      
      if (error) {
        console.error(`❌ Supabase error updating ${id} in ${this.tableName}:`, error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log(`✅ Updated customer ${id} in ${this.tableName}`);
    } catch (error) {
      console.error(`❌ Critical error updating ${id} in ${this.tableName}:`, error);
      throw error;
    }
  }
}

export const customerService = new CustomerSupabaseService();
