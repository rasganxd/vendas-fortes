
import { DeliveryRoute } from '@/types';
import { deliveryRouteLocalService } from '../local/deliveryRouteLocalService';

/**
 * Service for delivery route operations
 * Using local storage instead of Supabase
 */
export const deliveryRouteService = {
  // Get all delivery routes
  getAll: async (): Promise<DeliveryRoute[]> => {
    return deliveryRouteLocalService.getAll();
  },
  
  // Get delivery route by ID
  getById: async (id: string): Promise<DeliveryRoute | null> => {
    return deliveryRouteLocalService.getById(id);
  },
  
  // Add delivery route
  add: async (route: Omit<DeliveryRoute, 'id'>): Promise<string> => {
    const routeWithDates = {
      ...route,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return deliveryRouteLocalService.add(routeWithDates);
  },
  
  // Update delivery route
  update: async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    const updateData = {
      ...route,
      updatedAt: new Date()
    };
    return deliveryRouteLocalService.update(id, updateData);
  },
  
  // Delete delivery route
  delete: async (id: string): Promise<void> => {
    return deliveryRouteLocalService.delete(id);
  }
};
