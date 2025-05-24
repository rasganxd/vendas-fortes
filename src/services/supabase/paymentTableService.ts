
import { SupabaseService } from './supabaseService';
import { PaymentTable } from '@/types';

class PaymentTableSupabaseService extends SupabaseService<PaymentTable> {
  constructor() {
    super('payment_tables');
  }
}

export const paymentTableService = new PaymentTableSupabaseService();
