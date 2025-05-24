
import { SupabaseService } from './supabaseService';
import { DeliveryRoute } from '@/types';

class DeliveryRouteSupabaseService extends SupabaseService<DeliveryRoute> {
  constructor() {
    super('delivery_routes');
  }
}

export const deliveryRouteService = new DeliveryRouteSupabaseService();
