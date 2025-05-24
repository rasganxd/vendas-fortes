
import { SupabaseService } from './supabaseService';
import { PaymentTable } from '@/types';

class PaymentTableSupabaseService extends SupabaseService<PaymentTable> {
  constructor() {
    super('payment_tables');
  }

  // Override the transformFromDB method to map database fields to TypeScript interface
  protected transformFromDB(dbRecord: any): PaymentTable {
    const transformed = super.transformFromDB(dbRecord);
    
    // Map database snake_case fields to TypeScript camelCase
    return {
      ...transformed,
      payableTo: dbRecord.payable_to || '',
      paymentLocation: dbRecord.payment_location || ''
    };
  }

  // Override the transformToDB method to map TypeScript interface to database fields
  protected transformToDB(record: Partial<PaymentTable>): any {
    const transformed = super.transformToDB(record);
    
    // Map TypeScript camelCase fields to database snake_case
    const dbRecord = {
      ...transformed,
      payable_to: record.payableTo,
      payment_location: record.paymentLocation
    };

    // Remove the camelCase fields that don't exist in the database
    delete dbRecord.payableTo;
    delete dbRecord.paymentLocation;
    
    return dbRecord;
  }
}

export const paymentTableService = new PaymentTableSupabaseService();
