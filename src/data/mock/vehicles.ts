
import { Vehicle } from '@/types';
import { currentDate } from '../utils/mock-utils';

// Mock Vehicles data
export const mockVehicles: Vehicle[] = [
  {
    id: "veh1",
    name: "Fiorino 1",
    licensePlate: "ABC-1234",
    type: "van",
    model: "Fiat Fiorino",
    capacity: 500,
    active: true,
    createdAt: currentDate,
    updatedAt: currentDate,
    driverName: "José Motorista"
  },
  {
    id: "veh2",
    name: "Caminhão 3/4",
    licensePlate: "DEF-5678",
    type: "truck",
    model: "Mercedes-Benz 710",
    capacity: 4000,
    active: true,
    createdAt: currentDate,
    updatedAt: currentDate,
    driverName: "Carlos Motorista"
  },
  {
    id: "veh3",
    name: "Moto Entrega",
    licensePlate: "GHI-9012",
    type: "motorcycle",
    model: "Honda CG 160",
    capacity: 20,
    active: true,
    createdAt: currentDate,
    updatedAt: currentDate,
    driverName: "Roberto Motoboy"
  }
];
