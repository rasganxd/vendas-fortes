
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useSalesReps } from '@/hooks/useSalesReps';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useOrders } from '@/hooks/useOrders';
import { Customer, SalesRep, PaymentMethod, PaymentTable, Order } from '@/types';

interface AppDataContextType {
  // Customers
  customers: Customer[];
  isLoadingCustomers: boolean;
  refreshCustomers: () => Promise<void>;
  
  // Sales Reps
  salesReps: SalesRep[];
  isLoadingSalesReps: boolean;
  refreshSalesReps: () => Promise<void>;
  
  // Payment Methods
  paymentMethods: PaymentMethod[];
  isLoadingPaymentMethods: boolean;
  refreshPaymentMethods: () => Promise<void>;
  
  // Payment Tables
  paymentTables: PaymentTable[];
  isLoadingPaymentTables: boolean;
  refreshPaymentTables: () => Promise<void>;
  
  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  
  // Global refresh
  refreshData: () => Promise<void>;
  
  // Settings
  settings: {
    companyName: string;
  };
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Hooks for data management
  const customersHook = useCustomers();
  const salesRepsHook = useSalesReps();
  const paymentMethodsHook = usePaymentMethods();
  const paymentTablesHook = usePaymentTables();
  const ordersHook = useOrders();

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🚀 Initializing app data...');
        
        // Initialize all data
        await Promise.all([
          customersHook.refreshCustomers(),
          salesRepsHook.refreshSalesReps(),
          paymentMethodsHook.refreshPaymentMethods(),
          paymentTablesHook.refreshPaymentTables(),
          ordersHook.refreshOrders()
        ]);
        
        setIsInitialized(true);
        console.log('✅ App data initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing app data:', error);
      }
    };

    initializeData();
  }, []);

  const refreshData = async () => {
    console.log('🔄 Refreshing all app data...');
    try {
      await Promise.all([
        customersHook.refreshCustomers(),
        salesRepsHook.refreshSalesReps(),
        paymentMethodsHook.refreshPaymentMethods(),
        paymentTablesHook.refreshPaymentTables(),
        ordersHook.refreshOrders()
      ]);
      console.log('✅ All app data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing app data:', error);
    }
  };

  const contextValue: AppDataContextType = {
    // Customers
    customers: customersHook.customers,
    isLoadingCustomers: customersHook.isLoading,
    refreshCustomers: customersHook.refreshCustomers,
    
    // Sales Reps
    salesReps: salesRepsHook.salesReps,
    isLoadingSalesReps: salesRepsHook.isLoading,
    refreshSalesReps: salesRepsHook.refreshSalesReps,
    
    // Payment Methods
    paymentMethods: paymentMethodsHook.paymentMethods,
    isLoadingPaymentMethods: paymentMethodsHook.isLoading,
    refreshPaymentMethods: paymentMethodsHook.refreshPaymentMethods,
    
    // Payment Tables
    paymentTables: paymentTablesHook.paymentTables,
    isLoadingPaymentTables: paymentTablesHook.isLoading,
    refreshPaymentTables: paymentTablesHook.refreshPaymentTables,
    
    // Orders
    orders: ordersHook.orders,
    isLoadingOrders: ordersHook.isLoading,
    refreshOrders: ordersHook.refreshOrders,
    
    // Global refresh
    refreshData,
    
    // Settings
    settings: {
      companyName: 'Minha Empresa'
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
