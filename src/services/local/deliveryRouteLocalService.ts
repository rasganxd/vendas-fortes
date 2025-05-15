
import { DeliveryRoute } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for delivery routes
 */
class DeliveryRouteLocalService extends LocalStorageService<DeliveryRoute> {
  constructor() {
    super('delivery_routes');
  }
}

// Create a singleton instance
export const deliveryRouteLocalService = new DeliveryRouteLocalService();
