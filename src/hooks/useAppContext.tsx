
import { useAppData } from '@/context/providers/AppDataProvider';

export const useAppContext = () => {
  const appData = useAppData();
  
  return {
    // Customers
    customers: appData.customers,
    isLoadingCustomers: appData.isLoadingCustomers,
    refreshCustomers: appData.refreshCustomers,
    addCustomer: appData.addCustomer,
    updateCustomer: appData.updateCustomer,
    deleteCustomer: appData.deleteCustomer,
    
    // Sales Reps
    salesReps: appData.salesReps,
    isLoadingSalesReps: appData.isLoadingSalesReps,
    refreshSalesReps: appData.refreshSalesReps,
    
    // Products
    products: appData.products || [],
    isLoadingProducts: appData.isLoadingProducts || false,
    refreshProducts: appData.refreshProducts || (() => Promise.resolve()),
    addProduct: appData.addProduct,
    updateProduct: appData.updateProduct,
    deleteProduct: appData.deleteProduct,
    
    // Payment Methods
    paymentMethods: appData.paymentMethods,
    isLoadingPaymentMethods: appData.isLoadingPaymentMethods,
    refreshPaymentMethods: appData.refreshPaymentMethods,
    
    // Payment Tables
    paymentTables: appData.paymentTables,
    isLoadingPaymentTables: appData.isLoadingPaymentTables,
    refreshPaymentTables: appData.refreshPaymentTables,
    
    // Orders
    orders: appData.orders || [],
    isLoadingOrders: appData.isLoadingOrders || false,
    refreshOrders: appData.refreshOrders || (() => Promise.resolve()),
    addOrder: appData.addOrder,
    updateOrder: appData.updateOrder,
    deleteOrder: appData.deleteOrder,
    
    // Routes
    routes: appData.deliveryRoutes || [],
    isLoadingRoutes: appData.isLoadingDeliveryRoutes || false,
    refreshRoutes: appData.refreshDeliveryRoutes || (() => Promise.resolve()),
    addRoute: appData.addDeliveryRoute,
    updateRoute: appData.updateDeliveryRoute,
    deleteRoute: appData.deleteDeliveryRoute,
    generateRouteUpdate: async (routeId: string, salesRepId: string) => 0,
    
    // Vehicles
    vehicles: appData.vehicles || [],
    isLoadingVehicles: appData.isLoadingVehicles || false,
    refreshVehicles: appData.refreshVehicles || (() => Promise.resolve()),
    addVehicle: appData.addVehicle,
    updateVehicle: appData.updateVehicle,
    deleteVehicle: appData.deleteVehicle,
    
    // Loads
    loads: appData.loads || [],
    isLoadingLoads: appData.isLoadingLoads || false,
    refreshLoads: appData.refreshLoads || (() => Promise.resolve()),
    addLoad: appData.addLoad,
    updateLoad: appData.updateLoad,
    deleteLoad: appData.deleteLoad,
    
    // Payments
    payments: appData.payments || [],
    isLoadingPayments: appData.isLoadingPayments || false,
    refreshPayments: appData.refreshPayments || (() => Promise.resolve()),
    addPayment: appData.addPayment,
    updatePayment: appData.updatePayment,
    deletePayment: appData.deletePayment,
    
    // Settings
    settings: appData.settings,
    isLoadingSettings: appData.isLoadingSettings,
    refreshSettings: appData.refreshSettings,
    updateSettings: appData.updateSettings,
    
    // Connection Status
    connectionStatus: appData.connectionStatus || 'online',
    
    // Global refresh
    refreshData: appData.refreshData
  };
};
