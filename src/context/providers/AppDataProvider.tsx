
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Customer, Product, ProductBrand, ProductCategory, ProductGroup, SalesRep, Vehicle, DeliveryRoute, Load, Order, Payment, PaymentMethod, PaymentTable } from '@/types';
import { useAppOperations } from '@/context/operations/useAppOperations';
import { useConnection } from './ConnectionProvider';
import { useAppDataState } from './appData/useAppDataState';
import { useAppDataOperations } from './appData/useAppDataOperations';
import { useAppDataEventHandlers } from './appData/useAppDataEventHandlers';
import { useProductOperations } from '@/hooks/useProductOperations';

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
  refreshProducts: () => Promise<boolean>;
  addBulkProducts: (products: Omit<Product, 'id'>[]) => Promise<string[]>;

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
  updateOrder: (id: string, order: Partial<Order>) => Promise<string>;
  deleteOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;

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
  console.log('🚀 [AppDataProvider] Initializing AppDataProvider...');
  
  const appOperations = useAppOperations();
  const connection = useConnection();
  
  const {
    products,
    isLoadingProducts,
    addProductHook,
    updateProductHook,
    deleteProductHook,
    forceRefreshProducts,
    orders,
    isLoadingOrders,
    addOrderHook,
    updateOrderHook,
    deleteOrderHook,
    refreshOrdersHook,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited,
    customers,
    isLoadingCustomers,
    addCustomerHook,
    updateCustomerHook,
    deleteCustomerHook,
    generateNextCustomerCode,
    payments,
    isLoadingPayments,
    refreshPayments,
    addPaymentHook,
    updatePaymentHook,
    deletePaymentHook,
    confirmPaymentHook,
    calculatePaymentTotal,
    createAutomaticPaymentRecord,
    paymentTables,
    isLoadingPaymentTables,
    addPaymentTableHook,
    updatePaymentTableHook,
    deletePaymentTableHook
  } = useAppDataState();

  const {
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refreshPayments: refreshPaymentsOp,
    addPayment,
    updatePayment,
    deletePayment,
    confirmPayment,
    calculatePaymentTotal: calculatePaymentTotalOp,
    createAutomaticPaymentRecord: createAutomaticPaymentRecordOp,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = useAppDataOperations(
    addProductHook,
    updateProductHook,
    deleteProductHook,
    forceRefreshProducts,
    addOrderHook,
    updateOrderHook,
    deleteOrderHook,
    refreshOrdersHook,
    addCustomerHook,
    updateCustomerHook,
    deleteCustomerHook,
    refreshPayments,
    addPaymentHook,
    updatePaymentHook,
    deletePaymentHook,
    confirmPaymentHook,
    calculatePaymentTotal,
    createAutomaticPaymentRecord,
    addPaymentTableHook,
    updatePaymentTableHook,
    deletePaymentTableHook
  );

  // Add product operations for bulk operations
  const productOperations = useProductOperations(
    products,
    (newProducts) => {
      // This will be handled by the product operations
    },
    () => {}
  );

  useEffect(() => {
    console.log('📊 [AppDataProvider] Data state update:', {
      customers: customers.length,
      products: products.length,
      orders: orders.length,
      isLoadingCustomers,
      isLoadingProducts,
      isLoadingOrders,
      paymentTables: paymentTables.length,
      isLoadingPaymentTables
    });
  }, [customers, products, orders, isLoadingCustomers, isLoadingProducts, isLoadingOrders, paymentTables, isLoadingPaymentTables]);

  const refreshData = async (): Promise<boolean> => {
    try {
      console.log('🔄 [AppDataProvider] Refreshing all app data...');
      await Promise.all([
        refreshProducts(),
        refreshOrders()
      ]);
      console.log('✅ [AppDataProvider] All app data refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ [AppDataProvider] Error refreshing data:', error);
      return false;
    }
  };

  useAppDataEventHandlers(refreshData, markOrderAsBeingEdited, unmarkOrderAsBeingEdited);

  const value: AppDataContextType = {
    customers,
    isLoading: isLoadingCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    addBulkProducts: productOperations.addBulkProducts,
    
    orders,
    isLoadingOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    
    productBrands: appOperations.productBrands,
    isLoadingProductBrands: appOperations.isLoadingProductBrands,
    addProductBrand: appOperations.addProductBrand,
    updateProductBrand: appOperations.updateProductBrand,
    deleteProductBrand: appOperations.deleteProductBrand,
    productCategories: appOperations.productCategories,
    isLoadingProductCategories: appOperations.isLoadingProductCategories,
    addProductCategory: appOperations.addProductCategory,
    updateProductCategory: appOperations.updateProductCategory,
    deleteProductCategory: appOperations.deleteProductCategory,
    productGroups: appOperations.productGroups,
    isLoadingProductGroups: appOperations.isLoadingProductGroups,
    addProductGroup: appOperations.addProductGroup,
    updateProductGroup: appOperations.updateProductGroup,
    deleteProductGroup: appOperations.deleteProductGroup,
    salesReps: appOperations.salesReps,
    isLoadingSalesReps: appOperations.isLoadingSalesReps,
    addSalesRep: appOperations.addSalesRep,
    updateSalesRep: appOperations.updateSalesRep,
    deleteSalesRep: appOperations.deleteSalesRep,
    vehicles: appOperations.vehicles,
    isLoadingVehicles: appOperations.isLoadingVehicles,
    addVehicle: appOperations.addVehicle,
    updateVehicle: appOperations.updateVehicle,
    deleteVehicle: appOperations.deleteVehicle,
    deliveryRoutes: appOperations.deliveryRoutes,
    isLoadingDeliveryRoutes: appOperations.isLoadingDeliveryRoutes,
    addDeliveryRoute: appOperations.addDeliveryRoute,
    updateDeliveryRoute: appOperations.updateDeliveryRoute,
    deleteDeliveryRoute: appOperations.deleteDeliveryRoute,
    loads: appOperations.loads,
    isLoadingLoads: appOperations.isLoadingLoads,
    addLoad: appOperations.addLoad,
    updateLoad: appOperations.updateLoad,
    deleteLoad: appOperations.deleteLoad,
    payments,
    isLoadingPayments,
    addPayment,
    updatePayment,
    deletePayment,
    paymentMethods: appOperations.paymentMethods,
    isLoadingPaymentMethods: appOperations.isLoadingPaymentMethods,
    addPaymentMethod: appOperations.addPaymentMethod,
    updatePaymentMethod: appOperations.updatePaymentMethod,
    deletePaymentMethod: appOperations.deletePaymentMethod,
    paymentTables,
    isLoadingPaymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    connectionStatus: connection.connectionStatus,
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    settings: {
      primaryColor: '#3b82f6'
    },
    refreshData
  };

  console.log('✅ [AppDataProvider] Provider value assembled:', {
    customersLength: value.customers.length,
    productsLength: value.products.length,
    ordersLength: value.orders.length,
    paymentTablesLength: value.paymentTables.length,
    isLoadingCustomers: value.isLoading,
    isLoadingProducts: value.isLoadingProducts,
    isLoadingPaymentTables: value.isLoadingPaymentTables
  });

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
