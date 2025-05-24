
import { SupabaseService } from './supabaseService';
import { Payment } from '@/types';

class PaymentSupabaseService extends SupabaseService<Payment> {
  constructor() {
    super('payments');
  }
}

export const paymentService = new PaymentSupabaseService();
