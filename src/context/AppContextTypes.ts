
import { Customer, Product, Order, Payment, Vehicle, SalesRep, PaymentMethod, PaymentTable, ProductGroup, ProductCategory, ProductBrand, DeliveryRoute, Backup, AppSettings } from '@/types';
import { Load } from '@/types';
import { createContext } from 'react';
import defaultContextValues from './defaultContextValues';

// Define o tipo do status de conexão
export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

export type AppContextType = {
  // Dados principais
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  routes: any[]; // Alterado de Route[] para any[] para corrigir o problema de tipo
  loads: Load[];
  salesReps: SalesRep[];
  vehicles: Vehicle[];
  paymentMethods: PaymentMethod[];
  paymentTables: PaymentTable[];
  productGroups: ProductGroup[];
  productCategories: ProductCategory[];
  productBrands: ProductBrand[];
  deliveryRoutes: DeliveryRoute[];
  backups: Backup[];
  connectionStatus: ConnectionStatus;
  isUsingMockData: boolean;
  
  // Estados de carregamento
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isLoadingOrders: boolean;
  isLoadingPayments: boolean;
  isLoadingRoutes: boolean;
  isLoadingLoads: boolean;
  isLoadingSalesReps: boolean;
  isLoadingVehicles: boolean;
  isLoadingPaymentMethods: boolean;
  isLoadingPaymentTables: boolean;
  isLoadingProductGroups: boolean;
  isLoadingProductCategories: boolean;
  isLoadingProductBrands: boolean;
  isLoadingDeliveryRoutes: boolean;
  isLoadingBackups: boolean;
  
  // Setters para atualizar os estados
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
  setLoads: React.Dispatch<React.SetStateAction<Load[]>>;
  setSalesReps: React.Dispatch<React.SetStateAction<SalesRep[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  setPaymentTables: React.Dispatch<React.SetStateAction<PaymentTable[]>>;
  setProductGroups: React.Dispatch<React.SetStateAction<ProductGroup[]>>;
  setProductCategories: React.Dispatch<React.SetStateAction<ProductCategory[]>>;
  setProductBrands: React.Dispatch<React.SetStateAction<ProductBrand[]>>;
  setDeliveryRoutes: React.Dispatch<React.SetStateAction<DeliveryRoute[]>>;
  setBackups: React.Dispatch<React.SetStateAction<Backup[]>>;
  
  // Operações de cliente
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  generateNextCustomerCode: () => number;
  
  // Operações de produto
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  validateProductDiscount: (productId: string, discountedPrice: number) => string | boolean;
  getMinimumPrice: (productId: string) => number;
  addBulkProducts: (products: Omit<Product, 'id'>[]) => Promise<string[]>;
  
  // Operações de pedido
  getOrderById: (id: string) => Promise<Order | null>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<string>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Operações de rota
  addRoute: (route: Omit<any, 'id'>) => Promise<string>;
  updateRoute: (id: string, route: Partial<any>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  // Operações de carga
  addLoad: (load: Omit<Load, 'id'>) => Promise<string>;
  updateLoad: (id: string, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
  
  // Operações de representante de vendas
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;
  
  // Operações de veículo
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Operações de pagamento
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  createAutomaticPaymentRecord: (order: Order) => Promise<string | undefined>;
  
  // Operações de método de pagamento
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<string>;
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  
  // Operações de tabela de pagamento
  addPaymentTable: (table: Omit<PaymentTable, 'id'>) => Promise<string>;
  updatePaymentTable: (id: string, table: Partial<PaymentTable>) => Promise<void>;
  deletePaymentTable: (id: string) => Promise<void>;
  
  // Operações de grupo de produto
  addProductGroup: (group: Omit<ProductGroup, 'id'>) => Promise<string>;
  updateProductGroup: (id: string, group: Partial<ProductGroup>) => Promise<void>;
  deleteProductGroup: (id: string) => Promise<void>;
  
  // Operações de categoria de produto
  addProductCategory: (category: Omit<ProductCategory, 'id'>) => Promise<string>;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;
  
  // Operações de marca de produto
  addProductBrand: (brand: Omit<ProductBrand, 'id'>) => Promise<string>;
  updateProductBrand: (id: string, brand: Partial<ProductBrand>) => Promise<void>;
  deleteProductBrand: (id: string) => Promise<void>;
  
  // Operações de rota de entrega
  addDeliveryRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateDeliveryRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteDeliveryRoute: (id: string) => Promise<void>;
  
  // Operações de backup
  createBackup: (name?: string, description?: string) => Promise<string>;
  restoreBackup: (id: string) => Promise<boolean>;
  deleteBackup: (id: string) => Promise<boolean>;
  
  // Configurações
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Operações do sistema
  startNewMonth: () => Promise<boolean>;
  startNewDay: () => Promise<boolean>;
  clearCache: () => Promise<void>;
  refreshData: () => Promise<boolean>;
};

// Criar o contexto com valores padrão
export const AppContext = createContext<AppContextType>(defaultContextValues);
