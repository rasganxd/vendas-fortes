
import { DeliveryRoute } from '@/types';
import { deliveryRouteFirestoreService } from './DeliveryRouteFirestoreService';

/**
 * Service for delivery route operations using Firebase
 */
export const deliveryRouteService = {
  // Get all delivery routes
  getAll: async (): Promise<DeliveryRoute[]> => {
    return deliveryRouteFirestoreService.getAll();
  },
  
  // Get delivery route by ID
  getById: async (id: string): Promise<DeliveryRoute | null> => {
    return deliveryRouteFirestoreService.getById(id);
  },
  
  // Get delivery route by name
  getByName: async (name: string): Promise<DeliveryRoute | null> => {
    return deliveryRouteFirestoreService.getByName(name);
  },
  
  // Add delivery route
  add: async (route: Omit<DeliveryRoute, 'id'>): Promise<string> => {
    const routeWithDates = {
      ...route,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return deliveryRouteFirestoreService.add(routeWithDates);
  },
  
  // Update delivery route
  update: async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    const updateData = {
      ...route,
      updatedAt: new Date()
    };
    return deliveryRouteFirestoreService.update(id, updateData);
  },
  
  // Delete delivery route
  delete: async (id: string): Promise<void> => {
    return deliveryRouteFirestoreService.delete(id);
  }
};
