
import { SupabaseService } from './supabaseService';
import { Vehicle } from '@/types';

class VehicleSupabaseService extends SupabaseService<Vehicle> {
  constructor() {
    super('vehicles');
  }
}

export const vehicleService = new VehicleSupabaseService();
