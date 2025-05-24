
import React, { createContext, useContext, ReactNode } from 'react';
import { Customer, Product, ProductBrand, ProductCategory, ProductGroup, SalesRep, Vehicle, DeliveryRoute, Load, Order, Payment, PaymentMethod, PaymentTable } from '@/types';
import { useAppOperations } from '@/context/operations/appOperations';
import { useConnection } from './ConnectionProvider';

interface AppDataContextType {
  // Customer data
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  generateNextCustomerCode: () => Promise<number>;

  // Product data
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Product Brand data
  productBrands: ProductBrand[];
  isLoadingProductBrands: boolean;
  addProductBrand: (brand: Omit<ProductBrand, 'id'>) => Promise<string>;
  updateProductBrand: (id: string, brand: Partial<ProductBrand>) => Promise<void>;
  deleteProductBrand: (id: string) => Promise<void>;

  // Product Category data
  productCategories: ProductCategory[];
  isLoadingProductCategories: boolean;
  addProductCategory: (category: Omit<ProductCategory, 'id'>) => Promise<string>;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;

  // Product Group data
  productGroups: ProductGroup[];
  isLoadingProductGroups: boolean;
  addProductGroup: (group: Omit<ProductGroup, 'id'>) => Promise<string>;
  updateProductGroup: (id: string, group: Partial<ProductGroup>) => Promise<void>;
  deleteProductGroup: (id: string) => Promise<void>;

  // Sales Rep data
  salesReps: SalesRep[];
  isLoadingSalesReps: boolean;
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;

  // Vehicle data
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Delivery Route data
  deliveryRoutes: DeliveryRoute[];
  isLoadingDeliveryRoutes: boolean;
  addDeliveryRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateDeliveryRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteDeliveryRoute: (id: string) => Promise<void>;

  // Load data
  loads: Load[];
  isLoadingLoads: boolean;
  addLoad: (load: Omit<Load, 'id'>) => Promise<string>;
  updateLoad: (id: string, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;

  // Order data
  orders: Order[];
  isLoadingOrders: boolean;
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // Payment data
  payments: Payment[];
  isLoadingPayments: boolean;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  // Payment Method data
  paymentMethods: PaymentMethod[];
  isLoadingPaymentMethods: boolean;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<string>;
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;

  // Payment Table data
  paymentTables: PaymentTable[];
  isLoadingPaymentTables: boolean;
  addPaymentTable: (table: Omit<PaymentTable, 'id'>) => Promise<string>;
  updatePaymentTable: (id: string, table: Partial<PaymentTable>) => Promise<void>;
  deletePaymentTable: (id: string) => Promise<void>;

  // Connection status
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnectAttempt: Date | null;
  reconnectToSupabase: () => Promise<void>;
  testConnection: () => Promise<boolean>;

  // App settings
  settings?: {
    primaryColor?: string;
  };

  // Operations grouped
  productOperations?: any;
  customerOperations?: any;
  systemOperations?: any;

  // Data refresh function
  refreshData: () => Promise<boolean>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const appOperations = useAppOperations();
  const connection = useConnection();

  const refreshData = async (): Promise<boolean> => {
    try {
      console.log('Refreshing app data...');
      // Implement data refresh logic here
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return false;
    }
  };

  const value: AppDataContextType = {
    ...appOperations,
    connectionStatus: connection.connectionStatus,
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    settings: {
      primaryColor: '#3b82f6'
    },
    productOperations: appOperations.productOperations,
    customerOperations: appOperations.customerOperations,
    systemOperations: appOperations.systemOperations,
    refreshData
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
