
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

// Current date for created/updated fields
const currentDate = new Date();

// Mock Customers - updated to match Customer interface
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

// Mock Products - updated to match Product interface
export const mockProducts: Product[] = [
  {
    id: 'prod1',
    code: 1,
    name: 'Arroz Branco Premium',
    description: 'Pacote de arroz branco tipo 1, alta qualidade',
    price: 22.90,
    cost: 15.50,
    stock: 500,
    minStock: 50,
    unit: 'kg',
    categoryId: 'cat1',
    groupId: 'group1',
    brandId: 'brand1',
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    id: 'prod2',
    code: 2,
    name: 'Feijão Carioca',
    description: 'Pacote de feijão carioca tipo 1',
    price: 9.75,
    cost: 6.50,
    stock: 400,
    minStock: 40,
    unit: 'kg',
    categoryId: 'cat1',
    groupId: 'group1',
    brandId: 'brand2',
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    id: 'prod3',
    code: 3,
    name: 'Açúcar Refinado',
    description: 'Açúcar refinado especial',
    price: 5.49,
    cost: 3.75,
    stock: 600,
    minStock: 60,
    unit: 'kg',
    categoryId: 'cat2',
    groupId: 'group1',
    brandId: 'brand3',
    createdAt: currentDate,
    updatedAt: currentDate
  }
];

// Mock Order Items that comply with OrderItem interface
const generateOrderItems = (orderId: string): OrderItem[] => {
  const numItems = Math.floor(Math.random() * 4) + 1;
  const items: OrderItem[] = [];
  
  for (let i = 0; i < numItems; i++) {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const price = product.price;
    const discount = Math.random() > 0.7 ? product.price * 0.1 : 0;
    const total = quantity * (price - discount);
    
    items.push({
      id: `item-${orderId}-${i}`,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      quantity: quantity,
      price: price,
      unitPrice: price,
      discount: discount,
      total: total
    });
  }
  
  return items;
};

// Mock Sales Reps - updated to match SalesRep interface
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
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
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
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
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
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
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
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
  }
];

// Mock Vehicles - updated to match Vehicle interface
export const mockVehicles = [
  {
    id: "veh1",
    name: "Fiorino 1",
    licensePlate: "ABC-1234",
    type: "van",
    model: "Fiat Fiorino",
    capacity: 500,
    active: true,
    createdAt: currentDate,
    updatedAt: currentDate
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
    updatedAt: currentDate
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
    updatedAt: currentDate
  }
];

// Generate mock orders
export const mockOrders: Order[] = mockCustomers.flatMap((customer) => {
  // Generate 1-3 orders per customer
  const numOrders = Math.floor(Math.random() * 3) + 1;
  const orders: Order[] = [];
  
  for (let i = 0; i < numOrders; i++) {
    const salesRep = mockSalesReps[0];
    const orderId = `ord-${customer.id}-${i}`;
    const items = generateOrderItems(orderId);
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const statuses = ['draft', 'confirmed', 'completed', 'canceled'] as const;
    const paymentStatuses = ['pending', 'partial', 'paid'] as const;
    const orderDate = randomRecentDate();
    const dueDate = randomFutureDate();
    
    orders.push({
      id: orderId,
      code: parseInt(orderId.split('-').pop() || '0') + 1000,
      customerId: customer.id,
      customerName: customer.name,
      salesRepId: salesRep.id,
      salesRepName: salesRep.name,
      date: orderDate,
      dueDate: dueDate,
      items: items,
      total: total,
      discount: 0,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      paymentMethodId: "",
      paymentMethod: "",
      paymentTableId: "",
      payments: [],
      notes: Math.random() > 0.7 ? 'Observações especiais para este pedido' : "",
      createdAt: orderDate,
      updatedAt: orderDate,
      deliveryZip: customer.zip,
      deliveryAddress: customer.address,
      deliveryCity: customer.city,
      deliveryState: customer.state
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
      notes: Math.random() > 0.8 ? 'Pagamento confirmado' : "",
      createdAt: new Date(order.createdAt),
      updatedAt: currentDate
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
      customerId: customer.id, // Adding the required customerId
      customerName: customer.name,
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
      zipCode: customer.zipCode || "",
      lat: 0,
      lng: 0,
      sequence: index + 1,
      position: index + 1, // For compatibility
      status: 'pending' as const,
      completed: false
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

// Mock LoadItem type that matches our expected format
interface MockLoadItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  orderId?: string;
}

// Mock Load Items
const mockLoadItems = mockOrders
  .filter(order => order.status === 'confirmed')
  .flatMap(order => {
    return order.items.map(item => ({
      id: `load-item-${order.id}-${item.productId}`,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      total: item.price * item.quantity,
      orderId: order.id,
      productCode: item.productCode
    }));
  });

// Mock Loads
export const mockLoads: Load[] = [
  {
    id: 'load1',
    name: 'Carga - Van 01 - Segunda-feira',
    date: randomFutureDate(),
    vehicleId: 'veh1',
    vehicleName: 'Van 01',
    items: mockLoadItems.slice(0, 3),
    status: 'planning',
    total: mockLoadItems.slice(0, 3).reduce((sum, item) => sum + (item.total || 0), 0),
    notes: 'Separar produtos refrigerados',
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    id: 'load2',
    name: 'Carga - Van 02 - Terça-feira',
    date: randomFutureDate(),
    vehicleId: 'veh2',
    vehicleName: 'Van 02',
    items: mockLoadItems.slice(3),
    status: 'planning',
    total: mockLoadItems.slice(3).reduce((sum, item) => sum + (item.total || 0), 0),
    notes: '',
    createdAt: currentDate,
    updatedAt: currentDate
  }
];
