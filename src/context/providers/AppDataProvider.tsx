import React, { createContext, useState, useEffect, useContext } from 'react';
import { Customer, Order, Product, Payment } from '@/types';
import { Unit } from '@/types/unit';
import { PaymentMethod } from '@/types/payment';
import { PaymentTable } from '@/types/payment';
import { DeliveryRoute } from '@/types/delivery';
import { Vehicle } from '@/types/vehicle';
import { Load } from '@/types/delivery';
import { SalesRep } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { unitService } from '@/services/supabase/unitService';
import { paymentMethodService } from '@/services/supabase/paymentMethodService';
import { paymentTableService } from '@/services/supabase/paymentTableService';
import { deliveryRouteService } from '@/services/supabase/deliveryRouteService';
import { vehicleService } from '@/services/supabase/vehicleService';
import { loadService } from '@/services/supabase/loadService';
import { salesRepService } from '@/services/supabase/salesRepService';
import { productService } from '@/services/supabase/productService';

interface AppSettings {
  id: string;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    document: string;
    footer: string;
  };
  primary_color?: string;
  company_logo?: string;
}

interface AppDataContextType {
  customers: Customer[];
  isLoadingCustomers: boolean;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  salesReps: SalesRep[];
  isLoadingSalesReps: boolean;
  refreshSalesReps: () => Promise<void>;
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: Order[];
  isLoadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  addOrder: (orderData: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  payments: Payment[];
  isLoadingPayments: boolean;
  refreshPayments: () => Promise<void>;
  addPayment: (paymentData: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, paymentData: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  units: Unit[];
  isLoadingUnits: boolean;
  refreshUnits: () => Promise<void>;
  paymentMethods: PaymentMethod[];
  isLoadingPaymentMethods: boolean;
  refreshPaymentMethods: () => Promise<void>;
  paymentTables: PaymentTable[];
  isLoadingPaymentTables: boolean;
  refreshPaymentTables: () => Promise<void>;
  deliveryRoutes: DeliveryRoute[];
  isLoadingDeliveryRoutes: boolean;
  refreshDeliveryRoutes: () => Promise<void>;
  addDeliveryRoute: (routeData: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateDeliveryRoute: (id: string, routeData: Partial<DeliveryRoute>) => Promise<void>;
  deleteDeliveryRoute: (id: string) => Promise<void>;
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  loads: Load[];
  isLoadingLoads: boolean;
  refreshLoads: () => Promise<void>;
  addLoad: (loadData: Omit<Load, 'id'>) => Promise<string>;
  updateLoad: (id: string, loadData: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  settings?: AppSettings;
  isLoadingSettings?: boolean;
  refreshSettings?: () => Promise<void>;
  updateSettings?: (settings: Partial<AppSettings>) => Promise<void>;
  connectionStatus: 'online' | 'offline' | 'connecting' | 'error';
}

const defaultAppContext: AppDataContextType = {
  customers: [],
  isLoadingCustomers: false,
  refreshCustomers: async () => { },
  addCustomer: async () => "",
  updateCustomer: async () => { },
  deleteCustomer: async () => { },
  salesReps: [],
  isLoadingSalesReps: false,
  refreshSalesReps: async () => { },
  products: [],
  isLoadingProducts: false,
  refreshProducts: async () => { },
  addProduct: async () => "",
  updateProduct: async () => { },
  deleteProduct: async () => { },
  orders: [],
  isLoadingOrders: false,
  refreshOrders: async () => { },
  addOrder: async () => "",
  updateOrder: async () => { },
  deleteOrder: async () => { },
  payments: [],
  isLoadingPayments: false,
  refreshPayments: async () => { },
  addPayment: async () => "",
  updatePayment: async () => { },
  deletePayment: async () => { },
  units: [],
  isLoadingUnits: false,
  refreshUnits: async () => { },
  paymentMethods: [],
  isLoadingPaymentMethods: false,
  refreshPaymentMethods: async () => { },
  paymentTables: [],
  isLoadingPaymentTables: false,
  refreshPaymentTables: async () => { },
  deliveryRoutes: [],
  isLoadingDeliveryRoutes: false,
  refreshDeliveryRoutes: async () => { },
  addDeliveryRoute: async () => "",
  updateDeliveryRoute: async () => { },
  deleteDeliveryRoute: async () => { },
  vehicles: [],
  isLoadingVehicles: false,
  refreshVehicles: async () => { },
  addVehicle: async () => "",
  updateVehicle: async () => { },
  deleteVehicle: async () => { },
  loads: [],
  isLoadingLoads: false,
  refreshLoads: async () => { },
  refreshData: async () => { },
  settings: undefined,
  isLoadingSettings: false,
  refreshSettings: async () => { },
  updateSettings: async () => { },
  connectionStatus: 'online'
};

export const AppDataContext = createContext(defaultAppContext);
export const useAppData = () => useContext(AppDataContext);

const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Sales Reps
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoadingSalesReps, setIsLoadingSalesReps] = useState(false);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Units
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  // Payment Tables
  const [paymentTables, setPaymentTables] = useState<PaymentTable[]>([]);
  const [isLoadingPaymentTables, setIsLoadingPaymentTables] = useState(false);

  // Delivery Routes
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoadingDeliveryRoutes, setIsLoadingDeliveryRoutes] = useState(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Loads
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoadingLoads, setIsLoadingLoads] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings | undefined>();
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting' | 'error'>('online');

  // Customers Operations
  const refreshCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<string> => {
    try {
      const newCustomer = await customerService.create(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer.id;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await customerService.update(id, customerData);
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === id ? { ...customer, ...customerData } : customer
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerService.delete(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  };
  
  // Sales Reps Operations
  const refreshSalesReps = async () => {
    try {
      setIsLoadingSalesReps(true);
      const data = await salesRepService.getAll();
      setSalesReps(data);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    } finally {
      setIsLoadingSalesReps(false);
    }
  };

  // Products Operations
  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const newProduct = await productService.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct.id;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedProduct = await productService.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  };

  // Orders Operations
  const refreshOrders = async () => {
    try {
      setIsLoadingOrders(true);
      // Mock data for now
      setOrders([]);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
    try {
      // Mock implementation
      const newOrder = { ...orderData, id: Math.random().toString() } as Order;
      setOrders(prev => [...prev, newOrder]);
      return newOrder.id;
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      setOrders(prev => prev.map(order => order.id === id ? { ...order, ...orderData } : order));
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  };

  // Payments Operations
  const refreshPayments = async () => {
    try {
      setIsLoadingPayments(true);
      // Mock data for now
      setPayments([]);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>): Promise<string> => {
    try {
      const newPayment = { ...paymentData, id: Math.random().toString() } as Payment;
      setPayments(prev => [...prev, newPayment]);
      return newPayment.id;
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      throw error;
    }
  };

  const updatePayment = async (id: string, paymentData: Partial<Payment>) => {
    try {
      setPayments(prev => prev.map(payment => payment.id === id ? { ...payment, ...paymentData } : payment));
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      setPayments(prev => prev.filter(payment => payment.id !== id));
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      throw error;
    }
  };

  // Units Operations
  const refreshUnits = async () => {
    try {
      setIsLoadingUnits(true);
      const data = await unitService.getAll();
      setUnits(data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  // Payment Methods Operations
  const refreshPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true);
      const data = await paymentMethodService.getAll();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  // Payment Tables Operations
  const refreshPaymentTables = async () => {
    try {
      setIsLoadingPaymentTables(true);
      const data = await paymentTableService.getAll();
      setPaymentTables(data);
    } catch (error) {
      console.error('Erro ao carregar tabelas de pagamento:', error);
    } finally {
      setIsLoadingPaymentTables(false);
    }
  };

  // Delivery Routes Operations
  const refreshDeliveryRoutes = async () => {
    try {
      setIsLoadingDeliveryRoutes(true);
      const data = await deliveryRouteService.getAll();
      setDeliveryRoutes(data);
    } catch (error) {
      console.error('Erro ao carregar rotas de entrega:', error);
    } finally {
      setIsLoadingDeliveryRoutes(false);
    }
  };

  // Vehicles Operations
  const refreshVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  // Loads Operations
  const refreshLoads = async () => {
    try {
      setIsLoadingLoads(true);
      const data = await loadService.getAll();
      setLoads(data);
    } catch (error) {
      console.error('Erro ao carregar cargas:', error);
    } finally {
      setIsLoadingLoads(false);
    }
  };

  // Add Delivery Route Operations
  const addDeliveryRoute = async (routeData: Omit<DeliveryRoute, 'id'>): Promise<string> => {
    try {
      const newRoute = await deliveryRouteService.create(routeData);
      setDeliveryRoutes(prev => [...prev, newRoute]);
      return newRoute.id;
    } catch (error) {
      console.error('Erro ao adicionar rota:', error);
      throw error;
    }
  };

  // Add Vehicle Operations
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<string> => {
    try {
      const newVehicle = await vehicleService.create(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle.id;
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      throw error;
    }
  };

  // Add Load Operations
  const addLoad = async (loadData: Omit<Load, 'id'>): Promise<string> => {
    try {
      const newLoad = await loadService.create(loadData);
      setLoads(prev => [...prev, newLoad]);
      return newLoad.id;
    } catch (error) {
      console.error('Erro ao adicionar carga:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        refreshCustomers(),
        refreshSalesReps(),
        refreshProducts(),
        refreshOrders(),
        refreshPayments(),
        refreshUnits(),
        refreshPaymentMethods(),
        refreshPaymentTables(),
        refreshDeliveryRoutes(),
        refreshVehicles(),
        refreshLoads()
      ]);
    };

    loadData();
  }, []);

  const refreshSettings = async () => {
    try {
      setIsLoadingSettings(true);
      // Mock settings for now
      const mockSettings: AppSettings = {
        id: 'default',
        company: {
          name: 'Minha Empresa',
          email: 'contato@empresa.com',
          phone: '(11) 99999-9999',
          address: 'Rua das Flores, 123',
          document: '12.345.678/0001-90',
          footer: 'Obrigado pela preferência!'
        }
      };
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      setSettings(prev => prev ? { ...prev, ...newSettings } : newSettings as AppSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await Promise.all([
      refreshCustomers(),
      refreshSalesReps(),
      refreshProducts(),
      refreshOrders(),
      refreshPayments(),
      refreshUnits(),
      refreshPaymentMethods(),
      refreshPaymentTables(),
      refreshDeliveryRoutes(),
      refreshVehicles(),
      refreshLoads()
    ]);
  };

  const value = {
    // Customers
    customers,
    isLoadingCustomers,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,

    // Sales Reps
    salesReps,
    isLoadingSalesReps,
    refreshSalesReps,

    // Products
    products,
    isLoadingProducts,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,

    // Orders
    orders,
    isLoadingOrders,
    refreshOrders,
    addOrder,
    updateOrder,
    deleteOrder,

    // Payments
    payments,
    isLoadingPayments,
    refreshPayments,
    addPayment,
    updatePayment,
    deletePayment,

    // Units
    units,
    isLoadingUnits,
    refreshUnits,

    // Payment Methods
    paymentMethods,
    isLoadingPaymentMethods,
    refreshPaymentMethods,

    // Payment Tables
    paymentTables,
    isLoadingPaymentTables,
    refreshPaymentTables,

    // Delivery Routes
    deliveryRoutes,
    isLoadingDeliveryRoutes,
    refreshDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,

    // Vehicles
    vehicles,
    isLoadingVehicles,
    refreshVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,

    // Loads
    loads,
    isLoadingLoads,
    refreshLoads,
    addLoad,
    updateLoad,
    deleteLoad,

    // General
    refreshData,

    // Settings
    settings,
    isLoadingSettings,
    refreshSettings,
    updateSettings,

    // Connection status
    connectionStatus
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export { AppDataProvider };
export default AppDataProvider;
