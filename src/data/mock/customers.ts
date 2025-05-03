
import { Customer } from '@/types';
import { currentDate } from '../utils/mock-utils';

// Mock Customers data
export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    code: 1,
    name: 'Supermercado Central',
    document: '11.222.333/0001-44',
    phone: '(11) 3456-7890',
    email: 'contato@supermercadocentral.com',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-100',
    zipCode: '01310-100', // For compatibility
    notes: 'Cliente preferencial, entrega sempre pela manhã',
    createdAt: new Date('2023-01-15'),
    updatedAt: currentDate
  },
  {
    id: 'cust2',
    code: 2,
    name: 'Mercearia do Bairro',
    document: '222.333.444-55',
    phone: '(11) 2345-6789',
    email: 'contato@merceariadobairro.com',
    address: 'Rua Augusta, 500',
    city: 'São Paulo',
    state: 'SP',
    zip: '01305-000',
    zipCode: '01305-000', // For compatibility
    notes: '',
    createdAt: new Date('2023-02-20'),
    updatedAt: currentDate
  },
  {
    id: 'cust3',
    code: 3,
    name: 'Padaria Nova',
    document: '333.444.555-66',
    phone: '(11) 4567-8901',
    email: 'contato@padarianova.com',
    address: 'Rua Oscar Freire, 200',
    city: 'São Paulo',
    state: 'SP',
    zip: '01426-000',
    zipCode: '01426-000', // For compatibility
    notes: 'Entrega após as 10h',
    createdAt: new Date('2023-03-10'),
    updatedAt: currentDate
  },
  {
    id: 'cust4',
    code: 4,
    name: 'Restaurante Sabor & Arte',
    document: '44.555.666/0001-77',
    phone: '(11) 5678-9012',
    email: 'contato@saborearte.com',
    address: 'Alameda Santos, 700',
    city: 'São Paulo',
    state: 'SP',
    zip: '01419-000',
    zipCode: '01419-000', // For compatibility
    notes: '',
    createdAt: new Date('2023-04-05'),
    updatedAt: currentDate
  },
  {
    id: 'cust5',
    code: 5,
    name: 'Hotel Continental',
    document: '55.666.777/0001-88',
    phone: '(11) 6789-0123',
    email: 'contato@hotelcontinental.com',
    address: 'Av. Ipiranga, 800',
    city: 'São Paulo',
    state: 'SP',
    zip: '01040-000',
    zipCode: '01040-000', // For compatibility
    notes: 'Entrega somente até as 14h',
    createdAt: new Date('2023-05-12'),
    updatedAt: currentDate
  }
];
