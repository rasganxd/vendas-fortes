
import { Vehicle } from '@/types';
import { currentDate } from '../utils/mock-utils';

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'veh1',
    name: 'Van 01',
    plateNumber: 'ABC-1234',
    licensePlate: 'ABC-1234',
    type: 'van',
    model: 'Mercedes-Benz Sprinter',
    capacity: 1000,
    driverName: 'João Silva',
    active: true,
    status: 'available',
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    id: 'veh2',
    name: 'Van 02',
    plateNumber: 'DEF-5678',
    licensePlate: 'DEF-5678',
    type: 'van',
    model: 'Fiat Ducato',
    capacity: 800,
    driverName: 'Pedro Santos',
    active: true,
    status: 'available',
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    id: 'veh3',
    name: 'Caminhão 01',
    plateNumber: 'GHI-9012',
    licensePlate: 'GHI-9012',
    type: 'truck',
    model: 'Volkswagen Delivery',
    capacity: 3500,
    driverName: 'Carlos Ferreira',
    active: true,
    status: 'maintenance',
    notes: 'Em manutenção até 25/05',
    createdAt: currentDate,
    updatedAt: currentDate
  }
];
