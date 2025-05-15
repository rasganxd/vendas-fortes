
import { SalesRep } from '@/types';
import { currentDate } from '../utils/mock-utils';

// Mock Sales Representatives data
export const mockSalesReps: SalesRep[] = [
  {
    id: 'sr1',
    code: 1,
    name: 'João Silva',
    phone: '(11) 98765-4321',
    createdAt: currentDate,
    updatedAt: currentDate,
    active: true
  },
  {
    id: 'sr2',
    code: 2,
    name: 'Maria Oliveira',
    phone: '(11) 98765-4322',
    createdAt: currentDate,
    updatedAt: currentDate,
    active: true
  },
  {
    id: 'sr3',
    code: 3,
    name: 'Pedro Santos',
    phone: '(11) 98765-4323',
    createdAt: currentDate,
    updatedAt: currentDate,
    active: true
  },
  {
    id: 'sr4',
    code: 4,
    name: 'Ana Costa',
    phone: '(11) 98765-4324',
    createdAt: currentDate,
    updatedAt: currentDate,
    active: true
  }
];
