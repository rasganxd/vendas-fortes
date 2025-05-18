
import { Vehicle } from '@/types';
import { vehicleFirestoreService } from './VehicleFirestoreService';

/**
 * Service for vehicle operations using Firebase
 */
export const vehicleService = {
  // Get all vehicles
  getAll: async (): Promise<Vehicle[]> => {
    return vehicleFirestoreService.getAll();
  },
  
  // Get vehicle by ID
  getById: async (id: string): Promise<Vehicle | null> => {
    return vehicleFirestoreService.getById(id);
  },
  
  // Get vehicle by plate number
  getByPlateNumber: async (plateNumber: string): Promise<Vehicle | null> => {
    return vehicleFirestoreService.getByPlateNumber(plateNumber);
  },
  
  // Add vehicle
  add: async (vehicle: Omit<Vehicle, 'id'>): Promise<string> => {
    const vehicleWithDates = {
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return vehicleFirestoreService.add(vehicleWithDates);
  },
  
  // Update vehicle
  update: async (id: string, vehicle: Partial<Vehicle>): Promise<void> => {
    const updateData = {
      ...vehicle,
      updatedAt: new Date()
    };
    return vehicleFirestoreService.update(id, updateData);
  },
  
  // Delete vehicle
  delete: async (id: string): Promise<void> => {
    return vehicleFirestoreService.delete(id);
  }
};
