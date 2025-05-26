
import { SupabaseService } from './supabaseService';
import { Vehicle } from '@/types';

class VehicleSupabaseService extends SupabaseService<Vehicle> {
  constructor() {
    super('vehicles');
  }

  // Override transform methods to handle vehicle-specific field mappings
  protected transformFromDB(dbRecord: any): Vehicle {
    if (!dbRecord) return dbRecord;
    
    const transformed = { ...dbRecord };
    
    // Convert timestamp fields to Date objects
    if (dbRecord.created_at) {
      transformed.createdAt = new Date(dbRecord.created_at);
      delete transformed.created_at;
    }
    
    if (dbRecord.updated_at) {
      transformed.updatedAt = new Date(dbRecord.updated_at);
      delete transformed.updated_at;
    }

    // Map database fields to interface fields
    if (dbRecord.license_plate) {
      transformed.licensePlate = dbRecord.license_plate;
      delete transformed.license_plate;
    }

    if (dbRecord.plate_number) {
      transformed.plateNumber = dbRecord.plate_number;
      delete transformed.plate_number;
    }

    if (dbRecord.driver_name) {
      transformed.driverName = dbRecord.driver_name;
      delete transformed.driver_name;
    }
    
    return transformed as Vehicle;
  }

  protected transformToDB(record: Partial<Vehicle>): any {
    if (!record) return record;
    
    const transformed = { ...record } as any;
    
    // Convert dates and handle optional fields safely
    if ('createdAt' in transformed && transformed.createdAt) {
      transformed.created_at = transformed.createdAt.toISOString();
      delete transformed.createdAt;
    }
    
    if ('updatedAt' in transformed && transformed.updatedAt) {
      transformed.updated_at = transformed.updatedAt.toISOString();
      delete transformed.updatedAt;
    }

    // Map interface fields to database fields
    if ('licensePlate' in transformed) {
      transformed.license_plate = transformed.licensePlate;
      delete transformed.licensePlate;
    }

    if ('plateNumber' in transformed) {
      transformed.plate_number = transformed.plateNumber;
      delete transformed.plateNumber;
    }

    if ('driverName' in transformed) {
      transformed.driver_name = transformed.driverName;
      delete transformed.driverName;
    }
    
    // Remove id for inserts
    delete transformed.id;
    
    return transformed;
  }
}

export const vehicleService = new VehicleSupabaseService();
