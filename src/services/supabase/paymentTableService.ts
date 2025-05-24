
import { SupabaseService } from './supabaseService';
import { PaymentTable } from '@/types';

class PaymentTableSupabaseService extends SupabaseService<PaymentTable> {
  constructor() {
    super('payment_tables');
  }

  // Override the transformFromDB method to map database fields to TypeScript interface
  protected transformFromDB(dbRecord: any): PaymentTable {
    if (!dbRecord) return dbRecord;
    
    const baseTransformed = super.transformFromDB(dbRecord);
    
    // Map database snake_case fields to TypeScript camelCase
    return {
      ...baseTransformed,
      payableTo: dbRecord.payable_to || '',
      paymentLocation: dbRecord.payment_location || '',
      installments: dbRecord.installments || [],
      terms: dbRecord.terms || [],
      notes: dbRecord.notes || '',
      type: dbRecord.type || '',
      active: dbRecord.active !== undefined ? dbRecord.active : true
    };
  }

  // Override the transformToDB method to map TypeScript interface to database fields
  protected transformToDB(record: Partial<PaymentTable>): any {
    if (!record) return record;
    
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
    
    return dbRecord;
  }
}

export const paymentTableService = new PaymentTableSupabaseService();
