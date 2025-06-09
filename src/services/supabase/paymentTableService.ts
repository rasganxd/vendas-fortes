
import { SupabaseService } from './supabaseService';
import { PaymentTable } from '@/types';

class PaymentTableSupabaseService extends SupabaseService<PaymentTable> {
  constructor() {
    super('payment_tables');
  }

  // Override the transformFromDB method to map database fields to TypeScript interface
  protected transformFromDB(dbRecord: any): PaymentTable {
    if (!dbRecord) return dbRecord;
    
    console.log('🔄 [PaymentTableService] Transforming from DB:', dbRecord);
    
    const baseTransformed = super.transformFromDB(dbRecord);
    
    // Map database snake_case fields to TypeScript camelCase
    const transformed = {
      ...baseTransformed,
      payableTo: dbRecord.payable_to || '',
      paymentLocation: dbRecord.payment_location || '',
      installments: dbRecord.installments || [],
      terms: dbRecord.terms || [],
      notes: dbRecord.notes || '',
      type: dbRecord.type || '',
      active: dbRecord.active !== undefined ? dbRecord.active : true
    };

    console.log('✅ [PaymentTableService] Transformed from DB:', transformed);
    return transformed;
  }

  // Override the transformToDB method to map TypeScript interface to database fields
  protected transformToDB(record: Partial<PaymentTable>): any {
    if (!record) return record;
    
    console.log('🔄 [PaymentTableService] Transforming to DB:', record);
    
    const baseTransformed = super.transformToDB(record);
    
    // Map TypeScript camelCase fields to database snake_case
    const dbRecord = {
      ...baseTransformed,
      payable_to: record.payableTo,
      payment_location: record.paymentLocation,
      installments: record.installments || [],
      terms: record.terms || [],
      notes: record.notes || '',
      type: record.type || '',
      active: record.active !== undefined ? record.active : true
    };

    // Remove the camelCase fields that don't exist in the database
    delete dbRecord.payableTo;
    delete dbRecord.paymentLocation;
    
    console.log('✅ [PaymentTableService] Transformed to DB:', dbRecord);
    return dbRecord;
  }

  // Override update method to add logging
  async update(id: string, record: Partial<PaymentTable>): Promise<void> {
    try {
      console.log('💾 [PaymentTableService] Updating payment table:', id, record);
      
      const transformedRecord = this.transformToDB(record);
      console.log('📤 [PaymentTableService] Transformed record for update:', transformedRecord);
      
      const { error } = await this.supabase
        .from('payment_tables')
        .update(transformedRecord)
        .eq('id', id);
      
      if (error) {
        console.error('❌ [PaymentTableService] Supabase error updating payment table:', error);
        throw error;
      }
      
      console.log('✅ [PaymentTableService] Payment table updated successfully');
    } catch (error) {
      console.error('❌ [PaymentTableService] Error in payment table update:', error);
      throw error;
    }
  }
}

export const paymentTableService = new PaymentTableSupabaseService();
