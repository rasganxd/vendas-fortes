
import { Load } from '@/types';
import { mockLoadItems } from './loadItems';
import { randomFutureDate, currentDate } from '../utils/mock-utils';

// Mock Loads
export const mockLoads: Load[] = [
  {
    id: 'load1',
    name: 'Carga - Van 01 - Segunda-feira',
    date: randomFutureDate(),
    vehicleId: 'veh1',
    vehicleName: 'Van 01',
    salesRepId: 'sr1',
    items: mockLoadItems.slice(0, 3),
    status: 'pending',
    total: mockLoadItems.slice(0, 3).reduce((sum, item) => sum + (item.total || 0), 0),
    notes: 'Separar produtos refrigerados',
    createdAt: currentDate,
    updatedAt: currentDate,
    orderIds: Array.from(new Set(mockLoadItems.slice(0, 3).map(item => item.orderId || '')))
  },
  {
    id: 'load2',
    name: 'Carga - Van 02 - Terça-feira',
    date: randomFutureDate(),
    vehicleId: 'veh2',
    vehicleName: 'Van 02',
    salesRepId: 'sr2',
    items: mockLoadItems.slice(3),
    status: 'pending',
    total: mockLoadItems.slice(3).reduce((sum, item) => sum + (item.total || 0), 0),
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate,
    orderIds: Array.from(new Set(mockLoadItems.slice(3).map(item => item.orderId || '')))
  }
];
