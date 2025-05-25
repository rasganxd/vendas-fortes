
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Customer, Product, ProductBrand, ProductCategory, ProductGroup, SalesRep, Vehicle, DeliveryRoute, Load, Order, Payment, PaymentMethod, PaymentTable } from '@/types';
import { useAppOperations } from '@/context/operations/appOperations';
import { useConnection } from './ConnectionProvider';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';

interface AppDataContextType {
  // Customer data
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  generateNextCustomerCode: () => Promise<number>;

  // Product data - now centralized from useProducts hook
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<boolean>;

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

  // Order data - now centralized from useOrders hook
  orders: Order[];
  isLoadingOrders: boolean;
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
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
  
  // Use the centralized products hook
  const {
    products,
    isLoading: isLoadingProducts,
    addProduct: addProductHook,
    updateProduct: updateProductHook,
    deleteProduct: deleteProductHook,
    forceRefreshProducts
  } = useProducts();

  // Use the centralized orders hook
  const {
    orders,
    isLoading: isLoadingOrders,
    addOrder: addOrderHook,
    updateOrder: updateOrderHook,
    deleteOrder: deleteOrderHook,
    refreshOrders: refreshOrdersHook,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited
  } = useOrders();

  // Enhanced product operations with automatic refresh
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const result = await addProductHook(product);
    // Trigger refresh across all components
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'add', productId: result } }));
    return result;
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    await updateProductHook(id, product);
    // Trigger refresh across all components
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'update', productId: id } }));
  };

  const deleteProduct = async (id: string) => {
    await deleteProductHook(id);
    // Trigger refresh across all components
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'delete', productId: id } }));
  };

  const refreshProducts = async (): Promise<boolean> => {
    try {
      const result = await forceRefreshProducts();
      // Trigger refresh across all components
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'refresh' } }));
      return result;
    } catch (error) {
      console.error('Error refreshing products:', error);
      return false;
    }
  };

  // Enhanced order operations with automatic refresh
  const addOrder = async (order: Omit<Order, 'id'>) => {
    const result = await addOrderHook(order);
    return result;
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    await updateOrderHook(id, order);
  };

  const deleteOrder = async (id: string) => {
    await deleteOrderHook(id);
  };

  const refreshOrders = async (): Promise<void> => {
    await refreshOrdersHook();
  };

  const refreshData = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing all app data...');
      await Promise.all([
        refreshProducts(),
        refreshOrders()
      ]);
      console.log('✅ All app data refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      return false;
    }
  };

  // Set up global event listeners for data synchronization
  useEffect(() => {
    console.log('🔧 Setting up global data synchronization listeners');
    
    const handleDataSync = () => {
      console.log('🔄 Global data sync triggered');
      refreshData();
    };

    const handleOrderEditStarted = (event: CustomEvent) => {
      const { orderId } = event.detail;
      console.log('🔒 Order edit started:', orderId);
      markOrderAsBeingEdited(orderId);
    };

    const handleOrderEditFinished = (event: CustomEvent) => {
      const { orderId } = event.detail;
      console.log('🔓 Order edit finished:', orderId);
      unmarkOrderAsBeingEdited(orderId);
    };

    // Listen for manual refresh requests
    window.addEventListener('globalDataRefresh', handleDataSync);
    window.addEventListener('orderEditStarted', handleOrderEditStarted as EventListener);
    window.addEventListener('orderEditFinished', handleOrderEditFinished as EventListener);

    return () => {
      window.removeEventListener('globalDataRefresh', handleDataSync);
      window.removeEventListener('orderEditStarted', handleOrderEditStarted as EventListener);
      window.removeEventListener('orderEditFinished', handleOrderEditFinished as EventListener);
    };
  }, [markOrderAsBeingEdited, unmarkOrderAsBeingEdited]);

  const value: AppDataContextType = {
    // Use centralized products from useProducts hook
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    
    // Use centralized orders from useOrders hook  
    orders,
    isLoadingOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    
    // Keep existing operations
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
