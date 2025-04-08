
import { 
  Customer, 
  Product, 
  Order, 
  Payment, 
  DeliveryRoute, 
  Load, 
  SalesRep,
  OrderItem 
} from '@/types';

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Helper to generate random date within the past 30 days
const randomRecentDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date;
};

// Helper to generate future date
const randomFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1);
  return date;
};

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    name: 'Supermercado Central',
    email: 'contato@supermercadocentral.com',
    phone: '(11) 3456-7890',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    notes: 'Cliente preferencial, entrega sempre pela manhã',
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'cust2',
    name: 'Mercearia do Bairro',
    email: 'contato@mercearia.com',
    phone: '(11) 2345-6789',
    address: 'Rua Augusta, 500',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01305-000',
    createdAt: new Date('2023-02-20')
  },
  {
    id: 'cust3',
    name: 'Padaria Nova',
    email: 'contato@padarianova.com',
    phone: '(11) 4567-8901',
    address: 'Rua Oscar Freire, 200',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01426-000',
    notes: 'Entrega após as 10h',
    createdAt: new Date('2023-03-10')
  },
  {
    id: 'cust4',
    name: 'Restaurante Sabor & Arte',
    email: 'contato@saborearte.com',
    phone: '(11) 5678-9012',
    address: 'Alameda Santos, 700',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01419-000',
    createdAt: new Date('2023-04-05')
  },
  {
    id: 'cust5',
    name: 'Hotel Continental',
    email: 'compras@continental.com',
    phone: '(11) 6789-0123',
    address: 'Av. Ipiranga, 800',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01040-000',
    notes: 'Entrega somente até as 14h',
    createdAt: new Date('2023-05-12')
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod1',
    code: 1,
    name: 'Arroz Branco Premium',
    description: 'Pacote de arroz branco tipo 1, alta qualidade',
    price: 22.90,
    unit: 'kg',
    stock: 500,
    category: 'Grãos'
  },
  {
    id: 'prod2',
    code: 2,
    name: 'Feijão Carioca',
    description: 'Pacote de feijão carioca tipo 1',
    price: 9.75,
    unit: 'kg',
    stock: 400,
    category: 'Grãos'
  },
  {
    id: 'prod3',
    code: 3,
    name: 'Açúcar Refinado',
    description: 'Açúcar refinado especial',
    price: 5.49,
    unit: 'kg',
    stock: 600,
    category: 'Mercearia'
  },
  {
    id: 'prod4',
    code: 4,
    name: 'Café Torrado Moído',
    description: 'Café torrado e moído premium',
    price: 14.90,
    unit: 'pacote',
    stock: 300,
    category: 'Mercearia'
  },
  {
    id: 'prod5',
    code: 5,
    name: 'Óleo de Soja',
    description: 'Óleo de soja refinado',
    price: 7.95,
    unit: 'litro',
    stock: 450,
    category: 'Mercearia'
  },
  {
    id: 'prod6',
    code: 6,
    name: 'Macarrão Espaguete',
    description: 'Macarrão espaguete tradicional',
    price: 4.29,
    unit: 'pacote',
    stock: 350,
    category: 'Massas'
  },
  {
    id: 'prod7',
    code: 7,
    name: 'Sal Refinado',
    description: 'Sal refinado iodado',
    price: 2.99,
    unit: 'kg',
    stock: 700,
    category: 'Mercearia'
  }
];

// Mock Sales Representatives
export const mockSalesReps: SalesRep[] = [
  {
    id: 'sr1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '(11) 98765-4321',
    role: 'admin',
    region: 'Zona Sul',
    active: true
  },
  {
    id: 'sr2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@empresa.com',
    phone: '(11) 98765-4322',
    role: 'sales',
    region: 'Zona Norte',
    active: true
  },
  {
    id: 'sr3',
    name: 'Pedro Santos',
    email: 'pedro.santos@empresa.com',
    phone: '(11) 98765-4323',
    role: 'manager',
    region: 'Zona Leste',
    active: true
  },
  {
    id: 'sr4',
    name: 'Ana Costa',
    email: 'ana.costa@empresa.com',
    phone: '(11) 98765-4324',
    role: 'driver',
    active: true
  }
];

// Mock Vehicles
export const mockVehicles = [
  {
    id: "veh1",
    name: "Fiorino 1",
    licensePlate: "ABC-1234",
    type: "van",
    capacity: 500,
    active: true
  },
  {
    id: "veh2",
    name: "Caminhão 3/4",
    licensePlate: "DEF-5678",
    type: "truck",
    capacity: 4000,
    active: true
  },
  {
    id: "veh3",
    name: "Moto Entrega",
    licensePlate: "GHI-9012",
    type: "motorcycle",
    capacity: 20,
    active: true
  }
];

// Mock Order Items Helper
const generateOrderItems = (orderId: string): OrderItem[] => {
  const numItems = Math.floor(Math.random() * 4) + 1;
  const items: OrderItem[] = [];
  
  for (let i = 0; i < numItems; i++) {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const total = quantity * product.price;
    
    items.push({
      id: `item-${orderId}-${i}`,
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.price,
      total: total
    });
  }
  
  return items;
};

// Mock Orders
export const mockOrders: Order[] = mockCustomers.flatMap((customer) => {
  // Generate 1-3 orders per customer
  const numOrders = Math.floor(Math.random() * 3) + 1;
  const orders: Order[] = [];
  
  for (let i = 0; i < numOrders; i++) {
    const salesRep = mockSalesReps.find(sr => sr.role === 'sales') || mockSalesReps[0];
    const orderId = `ord-${customer.id}-${i}`;
    const items = generateOrderItems(orderId);
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const statuses = ['draft', 'confirmed', 'delivered', 'cancelled'] as const;
    const paymentStatuses = ['pending', 'partial', 'paid'] as const;
    
    orders.push({
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      salesRepId: salesRep.id,
      salesRepName: salesRep.name,
      items: items,
      total: total,
      status: statuses[Math.floor(Math.random() * 3)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * 3)],
      createdAt: randomRecentDate(),
      deliveryDate: randomFutureDate(),
      notes: Math.random() > 0.7 ? 'Observações especiais para este pedido' : undefined
    });
  }
  
  return orders;
});

// Mock Payments
export const mockPayments: Payment[] = mockOrders
  .filter(order => order.paymentStatus !== 'pending')
  .map(order => {
    const isPaid = order.paymentStatus === 'paid';
    const amount = isPaid ? order.total : order.total * 0.5;
    const methods = ['cash', 'credit', 'debit', 'transfer', 'check'] as const;
    
    return {
      id: `pay-${order.id}`,
      orderId: order.id,
      amount: amount,
      method: methods[Math.floor(Math.random() * methods.length)],
      status: 'completed',
      date: new Date(order.createdAt),
      notes: Math.random() > 0.8 ? 'Pagamento confirmado' : undefined
    };
  });

// Mock Route Stops
const mockStops = mockOrders
  .filter(order => order.status === 'confirmed')
  .map((order, index) => {
    const customer = mockCustomers.find(c => c.id === order.customerId) || mockCustomers[0];
    
    return {
      id: `stop-${order.id}`,
      orderId: order.id,
      customerName: customer.name,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      sequence: index + 1,
      status: 'pending' as const,
      estimatedArrival: new Date(order.deliveryDate || randomFutureDate())
    };
  });

// Mock Delivery Routes
export const mockRoutes: DeliveryRoute[] = [
  {
    id: 'route1',
    name: 'Rota Zona Sul - Segunda-feira',
    date: randomFutureDate(),
    driverId: 'sr4',
    driverName: 'Ana Costa',
    vehicleId: 'v1',
    vehicleName: 'Van 01',
    status: 'planning',
    stops: mockStops.slice(0, 3)
  },
  {
    id: 'route2',
    name: 'Rota Zona Leste - Terça-feira',
    date: randomFutureDate(),
    status: 'planning',
    stops: mockStops.slice(3)
  }
];

// Mock Load Items
const mockLoadItems = mockOrders
  .filter(order => order.status === 'confirmed')
  .map(order => {
    return {
      id: `load-item-${order.id}`,
      orderId: order.id,
      orderItems: order.items,
      totalWeight: Math.floor(Math.random() * 100) + 10,
      totalVolume: Math.floor(Math.random() * 5) + 1,
      status: 'pending' as const
    };
  });

// Mock Loads
export const mockLoads: Load[] = [
  {
    id: 'load1',
    name: 'Carga - Van 01 - Segunda-feira',
    date: randomFutureDate(),
    vehicleId: 'v1',
    vehicleName: 'Van 01',
    items: mockLoadItems.slice(0, 3),
    status: 'planning',
    notes: 'Separar produtos refrigerados'
  },
  {
    id: 'load2',
    name: 'Carga - Van 02 - Terça-feira',
    date: randomFutureDate(),
    vehicleId: 'v2',
    vehicleName: 'Van 02',
    items: mockLoadItems.slice(3),
    status: 'planning'
  }
];
