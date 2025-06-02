import React, { createContext, useState, useEffect, useContext } from 'react';
import { Customer } from '@/types';
import { Unit } from '@/types/unit';
import { PaymentMethod } from '@/types/payment';
import { PaymentTable } from '@/types/payment';
import { DeliveryRoute } from '@/types/delivery';
import { Vehicle } from '@/types/vehicle';
import { Load } from '@/types/delivery';
import { SalesRep } from '@/types';
import { Product } from '@/types/product';
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
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  refreshVehicles: () => Promise<void>;
  loads: Load[];
  isLoadingLoads: boolean;
  refreshLoads: () => Promise<void>;
  refreshData: () => Promise<void>;
  settings?: AppSettings;
  isLoadingSettings?: boolean;
  refreshSettings?: () => Promise<void>;
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
  vehicles: [],
  isLoadingVehicles: false,
  refreshVehicles: async () => { },
  loads: [],
  isLoadingLoads: false,
  refreshLoads: async () => { },
  refreshData: async () => { },
  settings: undefined,
  isLoadingSettings: false,
  refreshSettings: async () => { },
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

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        refreshCustomers(),
        refreshSalesReps(),
        refreshProducts(),
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

  const refreshData = async () => {
    await Promise.all([
      refreshCustomers(),
      refreshSalesReps(),
      refreshProducts(),
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

    // Vehicles
    vehicles,
    isLoadingVehicles,
    refreshVehicles,

    // Loads
    loads,
    isLoadingLoads,
    refreshLoads,

    // General
    refreshData,

    // Settings
    settings,
    isLoadingSettings,
    refreshSettings,

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
