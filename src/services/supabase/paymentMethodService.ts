
import { SupabaseService } from './supabaseService';
import { PaymentMethod } from '@/types';

class PaymentMethodSupabaseService extends SupabaseService<PaymentMethod> {
  constructor() {
    super('payment_methods');
  }
}

export const paymentMethodService = new PaymentMethodSupabaseService();
