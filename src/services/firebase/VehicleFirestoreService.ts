
import { Vehicle } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * Vehicle-specific Firestore service implementation
 */
class VehicleFirestoreServiceClass extends FirestoreService<Vehicle> {
  constructor() {
    super('vehicles');
  }

  /**
   * Get vehicle by plate number
   * @param plateNumber Vehicle plate number
   * @returns Vehicle or null if not found
   */
  async getByPlateNumber(plateNumber: string): Promise<Vehicle | null> {
    try {
      console.log(`VehicleFirestoreService: Getting vehicle by plate number ${plateNumber}`);
      const vehicles = await this.query([where('plateNumber', '==', plateNumber)]);
      
      if (vehicles.length > 0) {
        console.log(`VehicleFirestoreService: Found vehicle with plate number ${plateNumber}`);
        return vehicles[0];
      } else {
        console.log(`VehicleFirestoreService: No vehicle found with plate number ${plateNumber}`);
        return null;
      }
    } catch (error) {
      console.error(`VehicleFirestoreService: Error getting vehicle by plate number ${plateNumber}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const vehicleFirestoreService = new VehicleFirestoreServiceClass();
