
import { useAppData } from '@/context/providers/AppDataProvider';

export const useAppContext = () => {
  const appData = useAppData();
  
  return {
    // Customers
    customers: appData.customers,
    isLoadingCustomers: appData.isLoadingCustomers,
    refreshCustomers: appData.refreshCustomers,
    
    // Sales Reps
    salesReps: appData.salesReps,
    isLoadingSalesReps: appData.isLoadingSalesReps,
    refreshSalesReps: appData.refreshSalesReps,
    
    // Payment Methods
    paymentMethods: appData.paymentMethods,
    isLoadingPaymentMethods: appData.isLoadingPaymentMethods,
    refreshPaymentMethods: appData.refreshPaymentMethods,
    
    // Payment Tables
    paymentTables: appData.paymentTables,
    isLoadingPaymentTables: appData.isLoadingPaymentTables,
    refreshPaymentTables: appData.refreshPaymentTables,
    
    // Orders
    orders: appData.orders,
    isLoadingOrders: appData.isLoadingOrders,
    refreshOrders: appData.refreshOrders,
    
    // Global refresh
    refreshData: appData.refreshData
  };
};
