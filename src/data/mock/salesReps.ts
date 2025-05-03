
import { SalesRep } from '@/types';
import { currentDate } from '../utils/mock-utils';

// Mock Sales Representatives data
export const mockSalesReps: SalesRep[] = [
  {
    id: 'sr1',
    code: 1,
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234-567',
    document: 'documento-sr1',
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate,
    role: 'admin',
    region: 'Zona Sul',
    active: true
  },
  {
    id: 'sr2',
    code: 2,
    name: 'Maria Oliveira',
    email: 'maria.oliveira@empresa.com',
    phone: '(11) 98765-4322',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-100',
    document: 'documento-sr2',
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate,
    role: 'sales',
    region: 'Zona Norte',
    active: true
  },
  {
    id: 'sr3',
    code: 3,
    name: 'Pedro Santos',
    email: 'pedro.santos@empresa.com',
    phone: '(11) 98765-4323',
    address: 'Rua Augusta, 500',
    city: 'São Paulo',
    state: 'SP',
    zip: '01305-000',
    document: 'documento-sr3',
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate,
    role: 'manager',
    region: 'Zona Leste',
    active: true
  },
  {
    id: 'sr4',
    code: 4,
    name: 'Ana Costa',
    email: 'ana.costa@empresa.com',
    phone: '(11) 98765-4324',
    address: 'Rua Oscar Freire, 200',
    city: 'São Paulo',
    state: 'SP',
    zip: '01426-000',
    document: 'documento-sr4',
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate,
    role: 'driver',
    active: true
  }
];
