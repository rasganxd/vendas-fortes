
import { SupabaseService } from './supabaseService';
import { Payment } from '@/types';

class PaymentSupabaseService extends SupabaseService<Payment> {
  constructor() {
    super('payments');
  }

  // Override the transformFromDB method to handle date conversions and field mapping
  protected transformFromDB(dbRecord: any): Payment {
    if (!dbRecord) return dbRecord;
    
    console.log('🔄 Transforming payment from DB:', dbRecord);
    
    const transformed = {
      id: dbRecord.id,
      orderId: dbRecord.order_id,
      date: dbRecord.payment_date ? new Date(dbRecord.payment_date) : new Date(dbRecord.created_at),
      amount: Number(dbRecord.amount || 0),
      method: dbRecord.payment_method || dbRecord.method || '',
      notes: dbRecord.notes || '',
      createdAt: dbRecord.created_at ? new Date(dbRecord.created_at) : new Date(),
      updatedAt: dbRecord.updated_at ? new Date(dbRecord.updated_at) : new Date(),
      status: dbRecord.status || 'completed',
      
      // Additional properties used in PromissoryNoteView
      dueDate: dbRecord.due_date ? new Date(dbRecord.due_date) : undefined,
      amountInWords: dbRecord.amount_in_words,
      paymentLocation: dbRecord.payment_location,
      emissionLocation: dbRecord.emission_location,
      customerName: dbRecord.customer_name || '',
      customerDocument: dbRecord.customer_document,
      customerAddress: dbRecord.customer_address,
      installments: dbRecord.installments,
      paymentDate: dbRecord.payment_date ? new Date(dbRecord.payment_date) : undefined,
      
      // Mobile sync properties
      salesRepId: dbRecord.sales_rep_id,
      syncedToMobile: dbRecord.synced_to_mobile,
      lastSyncDate: dbRecord.last_sync_date ? new Date(dbRecord.last_sync_date) : undefined
    };

    console.log('✅ Transformed payment:', transformed);
    return transformed;
  }

  // Override the transformToDB method to handle field mapping to database schema
  protected transformToDB(record: Partial<Payment>): any {
    if (!record) return record;
    
    console.log('🔄 Transforming payment to DB:', record);
    
    const dbRecord = {
      order_id: record.orderId,
      payment_date: record.date ? record.date.toISOString() : new Date().toISOString(),
      amount: Number(record.amount || 0),
      payment_method: record.method || '',
      notes: record.notes || '',
      status: record.status || 'completed',
      customer_name: record.customerName || '',
      
      // Additional fields
      due_date: record.dueDate ? record.dueDate.toISOString() : null,
      amount_in_words: record.amountInWords,
      payment_location: record.paymentLocation,
      emission_location: record.emissionLocation,
      customer_document: record.customerDocument,
      customer_address: record.customerAddress,
      installments: record.installments,
      
      // Mobile sync properties
      sales_rep_id: record.salesRepId,
      synced_to_mobile: record.syncedToMobile,
      last_sync_date: record.lastSyncDate ? record.lastSyncDate.toISOString() : null
    };

    console.log('✅ Transformed payment to DB:', dbRecord);
    return dbRecord;
  }

  // Override add method to include better error handling and logging
  async add(record: Omit<Payment, 'id'>): Promise<string> {
    try {
      console.log('💾 Adding payment to Supabase:', record);
      
      const transformedRecord = this.transformToDB(record as Payment);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(transformedRecord)
        .select('id')
        .single();
      
      if (error) {
        console.error('❌ Supabase error adding payment:', error);
        throw error;
      }
      
      if (!data?.id) {
        throw new Error('No ID returned from payment insert');
      }
      
      console.log('✅ Payment added successfully with ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error in payment add:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentSupabaseService();
