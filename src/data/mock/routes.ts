
import { DeliveryRoute } from '@/types';
import { mockStops } from './routeStops';
import { randomFutureDate, currentDate } from '../utils/mock-utils';

// Mock Delivery Routes
export const mockRoutes: DeliveryRoute[] = [
  {
    id: 'route1',
    name: 'Rota Zona Sul - Segunda-feira',
    date: randomFutureDate(),
    driverId: 'sr4',
    driverName: 'Ana Costa',
    vehicleId: 'veh1',
    vehicleName: 'Van 01',
    status: 'pending',
    stops: mockStops.slice(0, 3),
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    id: 'route2',
    name: 'Rota Zona Leste - Terça-feira',
    date: randomFutureDate(),
    driverId: '',
    driverName: '',
    vehicleId: '',
    vehicleName: '',
    status: 'planning',
    stops: mockStops.slice(3),
    createdAt: currentDate,
    updatedAt: currentDate
  }
];
