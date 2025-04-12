
import React, { createContext, useState } from 'react';
import { Customer, Product, Order, Payment, Route, Load, SalesRep, Vehicle, PaymentMethod, PaymentTable, ProductGroup, ProductCategory, ProductBrand, DeliveryRoute, Backup, AppSettings } from '@/types';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';

interface AppContextType {
  // Data arrays
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  routes: DeliveryRoute[];
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
  
  // Loading states
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isLoadingOrders: boolean;
  isLoadingPayments: boolean;
  isLoadingRoutes: boolean;
  isLoadingLoads: boolean;
  isLoadingSalesReps: boolean;
  isLoadingVehicles: boolean;
  isLoadingPaymentTables: boolean;
  isLoadingBackups: boolean;
  
  // State setters
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<DeliveryRoute[]>>;
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
  
  // Methods from hooks
  // Route operations
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteRoute: (id: string) => Promise<boolean>;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  generateNextCustomerCode: () => number;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Order operations
  getOrderById: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<string>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Payment operations
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  // PaymentMethod operations
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<string>;
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  
  // Load operations
  addLoad: (load: Omit<Load, 'id'>) => Promise<string>;
  updateLoad: (id: string, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
  
  // SalesRep operations
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;
  
  // PaymentTable operations
  addPaymentTable: (paymentTable: Omit<PaymentTable, 'id'>) => Promise<string>;
  updatePaymentTable: (id: string, paymentTable: Partial<PaymentTable>) => Promise<void>;
  deletePaymentTable: (id: string) => Promise<void>;
  
  // Backup operations
  createBackup: (name: string, description?: string) => string;
  restoreBackup: (id: string) => boolean;
  deleteBackup: (id: string) => boolean;
  
  // App Settings
  settings: AppSettings | null;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType>({
  // Default empty values for data arrays
  customers: [],
  products: [],
  orders: [],
  payments: [],
  routes: [],
  loads: [],
  salesReps: [],
  vehicles: [],
  paymentMethods: [],
  paymentTables: [],
  productGroups: [],
  productCategories: [],
  productBrands: [],
  deliveryRoutes: [],
  backups: [],
  
  // Default loading states
  isLoadingCustomers: true,
  isLoadingProducts: true,
  isLoadingOrders: true,
  isLoadingPayments: true,
  isLoadingRoutes: true,
  isLoadingLoads: true,
  isLoadingSalesReps: true,
  isLoadingVehicles: true,
  isLoadingPaymentTables: true,
  isLoadingBackups: true,
  
  // Empty setters
  setCustomers: () => {},
  setProducts: () => {},
  setOrders: () => {},
  setPayments: () => {},
  setRoutes: () => {},
  setLoads: () => {},
  setSalesReps: () => {},
  setVehicles: () => {},
  setPaymentMethods: () => {},
  setPaymentTables: () => {},
  setProductGroups: () => {},
  setProductCategories: () => {},
  setProductBrands: () => {},
  setDeliveryRoutes: () => {},
  setBackups: () => {},
  
  // Empty method implementations
  addRoute: async () => "",
  updateRoute: async () => {},
  deleteRoute: async () => false,
  addCustomer: async () => "",
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  generateNextCustomerCode: () => 1,
  addProduct: async () => "",
  updateProduct: async () => {},
  deleteProduct: async () => {},
  getOrderById: () => undefined,
  addOrder: async () => "",
  updateOrder: async () => "",
  deleteOrder: async () => {},
  addVehicle: async () => "",
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  addPayment: async () => "",
  updatePayment: async () => {},
  deletePayment: async () => {},
  addPaymentMethod: async () => "",
  updatePaymentMethod: async () => {},
  deletePaymentMethod: async () => {},
  addLoad: async () => "",
  updateLoad: async () => {},
  deleteLoad: async () => {},
  addSalesRep: async () => "",
  updateSalesRep: async () => {},
  deleteSalesRep: async () => {},
  addPaymentTable: async () => "",
  updatePaymentTable: async () => {},
  deletePaymentTable: async () => {},
  createBackup: () => "",
  restoreBackup: () => false,
  deleteBackup: () => false,
  settings: null,
  updateSettings: async () => false,
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // State hooks for all data types
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  
  // Hook calls
  const { 
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode: generateNextCustomerCode,
    isLoading: isLoadingCustomers,
    setCustomers
  } = useCustomers();
  
  const { 
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading: isLoadingProducts,
    setProducts
  } = useProducts();
  
  const { 
    orders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading: isLoadingOrders,
    setOrders
  } = useOrders();
  
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    isLoading: isLoadingPayments,
    setPayments
  } = usePayments();
  
  const {
    routes,
    addRoute,
    updateRoute,
    deleteRoute,
    isLoading: isLoadingRoutes,
    setRoutes
  } = useRoutes();
  
  const {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    isLoading: isLoadingLoads,
    setLoads
  } = useLoads();
  
  const {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    isLoading: isLoadingSalesReps,
    setSalesReps
  } = useSalesReps();
  
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    isLoading: isLoadingVehicles,
    setVehicles
  } = useVehicles();
  
  const {
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    isLoading: isLoadingPaymentTables,
    setPaymentTables
  } = usePaymentTables();
  
  const {
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  const { 
    settings,
    updateSettings,
    isLoading: isLoadingSettings
  } = useAppSettings();

  return (
    <AppContext.Provider
      value={{
        // Data arrays
        customers,
        products,
        orders,
        payments,
        routes,
        loads,
        salesReps,
        vehicles,
        paymentMethods,
        paymentTables,
        productGroups,
        productCategories,
        productBrands,
        deliveryRoutes,
        backups,
        
        // Loading states
        isLoadingCustomers,
        isLoadingProducts,
        isLoadingOrders,
        isLoadingPayments,
        isLoadingRoutes,
        isLoadingLoads,
        isLoadingSalesReps,
        isLoadingVehicles,
        isLoadingPaymentTables,
        isLoadingBackups,
        
        // State setters
        setCustomers,
        setProducts,
        setOrders,
        setPayments,
        setRoutes,
        setLoads,
        setSalesReps,
        setVehicles,
        setPaymentMethods,
        setPaymentTables,
        setProductGroups,
        setProductCategories,
        setProductBrands,
        setDeliveryRoutes,
        setBackups,
        
        // Methods
        addRoute,
        updateRoute,
        deleteRoute,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        generateNextCustomerCode,
        addProduct,
        updateProduct,
        deleteProduct,
        getOrderById,
        addOrder,
        updateOrder,
        deleteOrder,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addPayment,
        updatePayment,
        deletePayment,
        addPaymentMethod: async () => "", // Placeholder
        updatePaymentMethod: async () => {}, // Placeholder
        deletePaymentMethod: async () => {}, // Placeholder
        addLoad,
        updateLoad,
        deleteLoad,
        addSalesRep,
        updateSalesRep,
        deleteSalesRep,
        addPaymentTable,
        updatePaymentTable,
        deletePaymentTable,
        createBackup,
        restoreBackup,
        deleteBackup,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
