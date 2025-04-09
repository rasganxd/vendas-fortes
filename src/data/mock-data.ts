
import { Customer, Product, Order, Payment, DeliveryRoute, Load, SalesRep, Vehicle } from '@/types';

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "c1",
    code: 1,
    name: "Supermercado Central",
    document: "123.456.789-00",
    phone: "(11) 3456-7890",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    notes: "Cliente VIP",
    createdAt: new Date("2023-01-15")
  },
  {
    id: "c2",
    code: 2,
    name: "Mercado Bom Preço",
    document: "98.765.432/0001-01",
    phone: "(11) 3333-4444",
    address: "Rua Augusta, 500",
    city: "São Paulo",
    state: "SP",
    zipCode: "01305-000",
    createdAt: new Date("2023-02-20")
  },
  {
    id: "c3",
    code: 3,
    name: "Mini Mercado Esperança",
    document: "456.789.123-00",
    phone: "(11) 2222-3333",
    address: "Rua Consolação, 250",
    city: "São Paulo",
    state: "SP",
    zipCode: "01301-000",
    notes: "Pequeno cliente",
    createdAt: new Date("2023-03-10")
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: "p1",
    code: 1,
    name: "Refrigerante Cola 2L",
    description: "Refrigerante sabor cola em garrafa PET de 2 litros",
    price: 8.99,
    unit: "un",
    stock: 500,
    category: "Bebidas"
  },
  {
    id: "p2",
    code: 2,
    name: "Arroz Branco 5kg",
    description: "Arroz branco tipo 1 em pacote de 5kg",
    price: 21.90,
    unit: "pacote",
    stock: 200,
    category: "Alimentos"
  },
  {
    id: "p3",
    code: 3,
    name: "Sabão em Pó 1kg",
    description: "Sabão em pó para roupas embalagem de 1kg",
    price: 15.50,
    unit: "caixa",
    stock: 150,
    category: "Limpeza"
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: "o1",
    customerId: "c1",
    customerName: "Supermercado Central",
    salesRepId: "s1",
    salesRepName: "Carlos Silva",
    items: [
      {
        id: "i1",
        productId: "p1",
        productName: "Refrigerante Cola 2L",
        quantity: 50,
        unitPrice: 8.99,
        total: 449.50
      },
      {
        id: "i2",
        productId: "p2",
        productName: "Arroz Branco 5kg",
        quantity: 20,
        unitPrice: 21.90,
        total: 438.00
      }
    ],
    total: 887.50,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "",
    createdAt: new Date("2023-04-10"),
    deliveryDate: new Date("2023-04-15"),
    deliveryAddress: "Av. Paulista, 1000",
    deliveryCity: "São Paulo",
    deliveryState: "SP",
    deliveryZipCode: "01310-100"
  },
  {
    id: "o2",
    customerId: "c2",
    customerName: "Mercado Bom Preço",
    salesRepId: "s2",
    salesRepName: "Ana Oliveira",
    items: [
      {
        id: "i3",
        productId: "p3",
        productName: "Sabão em Pó 1kg",
        quantity: 30,
        unitPrice: 15.50,
        total: 465.00
      }
    ],
    total: 465.00,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "",
    createdAt: new Date("2023-04-12"),
    deliveryDate: new Date("2023-04-17"),
    deliveryAddress: "Rua Augusta, 500",
    deliveryCity: "São Paulo",
    deliveryState: "SP",
    deliveryZipCode: "01305-000"
  }
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: "pay1",
    orderId: "o1",
    amount: 887.50,
    method: "transfer",
    status: "pending",
    date: new Date("2023-04-20"),
    notes: "Pagamento agendado"
  },
  {
    id: "pay2",
    orderId: "o2",
    amount: 465.00,
    method: "credit",
    status: "pending",
    date: new Date("2023-04-22")
  }
];

// Mock Routes
export const mockRoutes: DeliveryRoute[] = [
  {
    id: "r1",
    name: "Rota Centro - Manhã",
    date: new Date("2023-04-15"),
    vehicleId: "v1",
    vehicleName: "Caminhão Mercedes 710",
    status: "planning",
    stops: [
      {
        id: "s1",
        orderId: "o1",
        customerName: "Supermercado Central",
        address: "Av. Paulista, 1000",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
        position: 1,
        sequence: 1,
        status: "pending",
        estimatedArrival: new Date("2023-04-15T09:00:00")
      }
    ]
  },
  {
    id: "r2",
    name: "Rota Oeste - Tarde",
    date: new Date("2023-04-17"),
    vehicleId: "v2",
    vehicleName: "Van Sprinter",
    status: "planning",
    stops: [
      {
        id: "s2",
        orderId: "o2",
        customerName: "Mercado Bom Preço",
        address: "Rua Augusta, 500",
        city: "São Paulo",
        state: "SP",
        zipCode: "01305-000",
        position: 1,
        sequence: 1,
        status: "pending",
        estimatedArrival: new Date("2023-04-17T14:00:00")
      }
    ]
  }
];

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    name: "Caminhão Mercedes 710",
    licensePlate: "ABC-1234",
    type: "truck",
    capacity: 3500,
    active: true
  },
  {
    id: "v2",
    name: "Van Sprinter",
    licensePlate: "DEF-5678",
    type: "van",
    capacity: 1200,
    active: true
  },
  {
    id: "v3",
    name: "Carro Fiorino",
    licensePlate: "GHI-9012",
    type: "car",
    capacity: 500,
    active: true
  }
];

// Mock Loads
export const mockLoads: Load[] = [
  {
    id: "l1",
    name: "Carga Centro - 15/04",
    date: new Date("2023-04-15"),
    vehicleId: "v1",
    vehicleName: "Caminhão Mercedes 710",
    items: [
      {
        id: "li1",
        orderId: "o1",
        orderItems: [
          {
            id: "i1",
            productId: "p1",
            productName: "Refrigerante Cola 2L",
            quantity: 50,
            unitPrice: 8.99,
            total: 449.50
          },
          {
            id: "i2",
            productId: "p2",
            productName: "Arroz Branco 5kg",
            quantity: 20,
            unitPrice: 21.90,
            total: 438.00
          }
        ],
        status: "pending"
      }
    ],
    status: "planning",
    notes: "Carga para região central"
  }
];

// Mock Sales Reps
export const mockSalesReps: SalesRep[] = [
  {
    id: "s1",
    code: 1,
    name: "Carlos Silva",
    email: "carlos@salestrack.com",
    phone: "(11) 99876-5432",
    role: "sales",
    region: "Centro",
    active: true
  },
  {
    id: "s2",
    code: 2,
    name: "Ana Oliveira",
    email: "ana@salestrack.com",
    phone: "(11) 99765-4321",
    role: "sales",
    region: "Zona Oeste",
    active: true
  },
  {
    id: "s3",
    code: 3,
    name: "João Pereira",
    email: "joao@salestrack.com",
    phone: "(11) 99654-3210",
    role: "driver",
    region: "Todas",
    active: true
  },
  {
    id: "s4",
    code: 4,
    name: "Marta Santos",
    email: "marta@salestrack.com",
    phone: "(11) 99543-2109",
    role: "manager",
    region: "Todas",
    active: true
  }
];
