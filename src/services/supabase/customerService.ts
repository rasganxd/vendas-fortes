
import { SupabaseService } from './supabaseService';
import { Customer } from '@/types';

class CustomerSupabaseService extends SupabaseService<Customer> {
  constructor() {
    super('customers');
  }

  // Override getAll to include sales rep name and ensure proper filtering
  async getAll(): Promise<Customer[]> {
    try {
      console.log(`🔄 [CustomerService] Getting all records from ${this.tableName} with sales rep info`);
      
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select(`
          *,
          sales_reps!sales_rep_id (
            id,
            name
          )
        `)
        .order('name');
      
      if (error) {
        console.error(`❌ [CustomerService] Supabase error getting from ${this.tableName}:`, error);
        throw error;
      }
      
      if (!data) {
        console.log(`📋 [CustomerService] No data found in ${this.tableName}`);
        return [];
      }
      
      console.log(`📊 [CustomerService] Raw data from Supabase:`, data);
      console.log(`📊 [CustomerService] Data length:`, data.length);
      
      // Transform data to include sales rep name and log associations
      const transformedData = data.map((item, index) => {
        console.log(`🔄 [CustomerService] Transforming item ${index + 1}:`, item);
        const transformed = this.transformFromDB(item);
        console.log(`✅ [CustomerService] Transformed item ${index + 1}:`, transformed);
        console.log(`🔗 [CustomerService] Customer ${transformed.name} -> Sales Rep ID: ${transformed.salesRepId}, Name: ${transformed.salesRepName}`);
        return transformed;
      });
      
      console.log(`✅ [CustomerService] Retrieved ${transformedData.length} records from ${this.tableName}`);
      console.log(`📋 [CustomerService] Final transformed data:`, transformedData);
      return transformedData;
    } catch (error) {
      console.error(`❌ [CustomerService] Critical error getting from ${this.tableName}:`, error);
      throw error;
    }
  }

  // Override the transformFromDB method to map database fields to TypeScript interface
  protected transformFromDB(dbRecord: any): Customer {
    if (!dbRecord) return dbRecord;
    
    const baseTransformed = super.transformFromDB(dbRecord);
    
    // Extract sales rep info from the joined data
    const salesRepData = dbRecord.sales_reps;
    const salesRepId = dbRecord.sales_rep_id;
    const salesRepName = salesRepData?.name || undefined;
    
    console.log(`🔍 [CustomerService] Transforming customer ${dbRecord.name}: sales_rep_id=${salesRepId}, sales_rep_name=${salesRepName}`);
    
    // Map database snake_case fields to TypeScript camelCase
    const transformedCustomer = {
      ...baseTransformed,
      companyName: dbRecord.company_name || '',
      visitDays: dbRecord.visit_days || [],
      visitFrequency: dbRecord.visit_frequency || '',
      visitSequence: dbRecord.visit_sequence || 0,
      salesRepId: salesRepId || undefined,
      salesRepName: salesRepName,
      deliveryRouteId: dbRecord.delivery_route_id || undefined,
      zipCode: dbRecord.zip_code || '',
      // Ensure zip is set from zip_code for consistency
      zip: dbRecord.zip_code || dbRecord.zip || '',
      // Map additional fields with proper defaults
      creditLimit: dbRecord.credit_limit || 0,
      paymentTerms: dbRecord.payment_terms || '',
      region: dbRecord.region || '',
      category: dbRecord.category || '',
      document: dbRecord.document || '',
      notes: dbRecord.notes || ''
    };

    console.log(`✅ [CustomerService] Final transformed customer:`, transformedCustomer);
    return transformedCustomer;
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
      delivery_route_id: record.deliveryRouteId || null,
      zip_code: record.zip || record.zipCode || '',
      credit_limit: record.creditLimit || 0,
      payment_terms: record.paymentTerms || '',
      region: record.region || '',
      category: record.category || ''
    };

    console.log(`📝 [CustomerService] Transform to DB - Customer: ${record.name}, sales_rep_id: ${dbRecord.sales_rep_id}`);

    // Remove the camelCase fields that don't exist in the database
    delete dbRecord.companyName;
    delete dbRecord.visitDays;
    delete dbRecord.visitFrequency;
    delete dbRecord.visitSequence;
    delete dbRecord.salesRepId;
    delete dbRecord.salesRepName; // This field doesn't exist in DB, so remove it
    delete dbRecord.deliveryRouteId;
    delete dbRecord.zipCode;
    delete dbRecord.zip;
    delete dbRecord.syncPending;
    delete dbRecord.creditLimit;
    delete dbRecord.paymentTerms;
    
    console.log("📝 [CustomerService] Transform to DB result:", dbRecord);
    return dbRecord;
  }

  async generateNextCode(): Promise<number> {
    try {
      console.log("🔢 [CustomerService] Generating next customer code...");
      const { data, error } = await this.supabase.rpc('get_next_customer_code');
      
      if (error) {
        console.error('❌ [CustomerService] Error calling get_next_customer_code RPC:', error);
        // Fallback: get max code and add 1
        console.log("🔄 [CustomerService] Using fallback method to generate code...");
        const allCustomers = await this.getAll();
        const maxCode = allCustomers.reduce((max, customer) => Math.max(max, customer.code || 0), 0);
        const nextCode = maxCode + 1;
        console.log("✅ [CustomerService] Fallback generated code:", nextCode);
        return nextCode;
      }
      
      console.log("✅ [CustomerService] RPC generated code:", data);
      return data || 1;
    } catch (error) {
      console.error('❌ [CustomerService] Critical error generating customer code:', error);
      return 1;
    }
  }

  async add(entity: Omit<Customer, 'id'>): Promise<string> {
    try {
      console.log(`🔄 [CustomerService] Starting add operation for ${this.tableName}`);
      console.log("📝 [CustomerService] Entity data (before transformation):", entity);
      
      // Use the parent transformToDB method to properly map fields
      const transformedData = this.transformToDB(entity as Customer);
      console.log("🔄 [CustomerService] Data after transformation:", transformedData);
      
      const dataWithTimestamps = {
        ...transformedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true
      };
      
      console.log("📋 [CustomerService] Data prepared for Supabase:", dataWithTimestamps);
      
      console.log("🔄 [CustomerService] Calling Supabase insert...");
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .insert(dataWithTimestamps)
        .select('id')
        .single();
      
      if (error) {
        console.error(`❌ [CustomerService] Supabase error adding to ${this.tableName}:`, error);
        console.error("❌ [CustomerService] Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      if (!data) {
        console.error(`❌ [CustomerService] No data returned from insert`);
        throw new Error("No data returned from Supabase insert");
      }
      
      const insertedId = (data as any).id;
      console.log(`✅ [CustomerService] Customer added to ${this.tableName} with ID:`, insertedId);
      
      if (!insertedId) {
        console.error(`❌ [CustomerService] Insert succeeded but no ID returned`);
        throw new Error("Insert succeeded but no ID returned");
      }
      
      return insertedId;
    } catch (error) {
      console.error(`❌ [CustomerService] Critical error adding to ${this.tableName}:`, error);
      console.error("❌ [CustomerService] Full error object:", error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<Customer>): Promise<void> {
    try {
      console.log(`📝 [CustomerService] Updating customer ${id} in ${this.tableName}`);
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
        console.error(`❌ [CustomerService] Supabase error updating ${id} in ${this.tableName}:`, error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log(`✅ [CustomerService] Updated customer ${id} in ${this.tableName}`);
    } catch (error) {
      console.error(`❌ [CustomerService] Critical error updating ${id} in ${this.tableName}:`, error);
      throw error;
    }
  }
}

export const customerService = new CustomerSupabaseService();
