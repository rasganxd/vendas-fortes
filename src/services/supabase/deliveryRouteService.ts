
import { DeliveryRoute } from '@/types';
import { deliveryRouteService as firebaseDeliveryRouteService } from '../firebase/deliveryRouteService';

/**
 * Service for delivery route operations
 * Using Firebase instead of local storage
 */
export const deliveryRouteService = {
  // Get all delivery routes
  getAll: async (): Promise<DeliveryRoute[]> => {
    return firebaseDeliveryRouteService.getAll();
  },
  
  // Get delivery route by ID
  getById: async (id: string): Promise<DeliveryRoute | null> => {
    return firebaseDeliveryRouteService.getById(id);
  },
  
  // Add delivery route
  add: async (route: Omit<DeliveryRoute, 'id'>): Promise<string> => {
    return firebaseDeliveryRouteService.add(route);
  },
  
  // Update delivery route
  update: async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    return firebaseDeliveryRouteService.update(id, route);
  },
  
  // Delete delivery route
  delete: async (id: string): Promise<void> => {
    return firebaseDeliveryRouteService.delete(id);
  }
};
