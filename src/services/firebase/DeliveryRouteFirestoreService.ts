
import { DeliveryRoute } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * DeliveryRoute-specific Firestore service implementation
 */
class DeliveryRouteFirestoreServiceClass extends FirestoreService<DeliveryRoute> {
  constructor() {
    super('delivery_routes');
  }

  /**
   * Get delivery route by name
   * @param name Route name
   * @returns DeliveryRoute or null if not found
   */
  async getByName(name: string): Promise<DeliveryRoute | null> {
    try {
      console.log(`DeliveryRouteFirestoreService: Getting delivery route by name ${name}`);
      const routes = await this.query([where('name', '==', name)]);
      
      if (routes.length > 0) {
        console.log(`DeliveryRouteFirestoreService: Found route with name ${name}`);
        return routes[0];
      } else {
        console.log(`DeliveryRouteFirestoreService: No route found with name ${name}`);
        return null;
      }
    } catch (error) {
      console.error(`DeliveryRouteFirestoreService: Error getting route by name ${name}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const deliveryRouteFirestoreService = new DeliveryRouteFirestoreServiceClass();
