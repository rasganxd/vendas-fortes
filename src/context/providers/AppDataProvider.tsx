import React, { createContext, useContext } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, Product, Order, Load, ProductGroup } from '@/types';
import { useConnection } from './ConnectionProvider';
import { useDataLoading } from './DataLoadingProvider';

// Tipo para o contexto de dados da aplicação
interface AppDataContextType {
  // Estados de dados principais
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: any[];
  routes: any[];
  loads: Load[];
  salesReps: any[];
  vehicles: any[];
  paymentMethods: any[];
  paymentTables: any[];
  productGroups: ProductGroup[];
  productCategories: any[];
  productBrands: any[];
  deliveryRoutes: any[];
  backups: any[];
  settings: any;
  
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
  setPayments: React.Dispatch<React.SetStateAction<any[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
  setLoads: React.Dispatch<React.SetStateAction<Load[]>>;
  setSalesReps: React.Dispatch<React.SetStateAction<any[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
  setPaymentMethods: React.Dispatch<React.SetStateAction<any[]>>;
  setPaymentTables: React.Dispatch<React.SetStateAction<any[]>>;
  setBackups: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Status da conexão
  connectionStatus: 'online' | 'offline' | 'connecting' | 'error';
  isUsingMockData: boolean;
  
  // Função para atualizar os dados
  refreshData: () => Promise<boolean>;
}

// Create the context
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Provider dos dados da aplicação
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  // Obter status da conexão do provider
  const { connectionStatus } = useConnection();
  
  // Obter dados principais do DataLoadingProvider
  const { 
    customers, 
    products, 
    isLoadingCustomers, 
    isLoadingProducts, 
    isUsingMockData, 
    setCustomers,
    setProducts,
    refreshData
  } = useDataLoading();
  
  // Obter dados de outros hooks
  const { 
    orders,
    setOrders,
    isLoading: isLoadingOrders
  } = useOrders();
  
  const { 
    payments,
    isLoading: isLoadingPayments,
    setPayments
  } = usePayments();
  
  const {
    routes,
    isLoading: isLoadingRoutes,
    setRoutes
  } = useRoutes();
  
  const {
    loads,
    isLoading: isLoadingLoads,
    setLoads
  } = useLoads();
  
  const {
    salesReps,
    isLoading: isLoadingSalesReps,
    setSalesReps
  } = useSalesReps();
  
  const {
    vehicles,
    isLoading: isLoadingVehicles,
    setVehicles
  } = useVehicles();
  
  const {
    paymentMethods,
    setPaymentMethods
  } = usePaymentMethods();
  
  const {
    paymentTables,
    isLoading: isLoadingPaymentTables,
    setPaymentTables
  } = usePaymentTables();
  
  const {
    productGroups: fetchedProductGroups,
    isLoading: isLoadingProductGroups
  } = useProductGroups();
  
  const {
    productCategories: fetchedProductCategories,
    isLoading: isLoadingProductCategories
  } = useProductCategories();
  
  const {
    productBrands: fetchedProductBrands,
    isLoading: isLoadingProductBrands
  } = useProductBrands();
  
  const {
    deliveryRoutes: fetchedDeliveryRoutes,
    isLoading: isLoadingDeliveryRoutes
  } = useDeliveryRoutes();
  
  const {
    backups,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  const { 
    settings,
    isLoading: isLoadingSettings
  } = useAppSettings();
  
  // Construir o valor do contexto
  const contextValue: AppDataContextType = {
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
    productGroups: fetchedProductGroups,
    productCategories: fetchedProductCategories,
    productBrands: fetchedProductBrands,
    deliveryRoutes: fetchedDeliveryRoutes,
    backups,
    settings,
    connectionStatus,
    
    isLoadingCustomers,
    isLoadingProducts,
    isLoadingOrders,
    isLoadingPayments,
    isLoadingRoutes,
    isLoadingLoads,
    isLoadingSalesReps,
    isLoadingVehicles,
    isLoadingPaymentMethods: false,
    isLoadingPaymentTables,
    isLoadingProductGroups,
    isLoadingProductCategories,
    isLoadingProductBrands,
    isLoadingDeliveryRoutes,
    isLoadingBackups,
    isUsingMockData,
    
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
    setBackups,
    
    refreshData
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

// Hook para acessar os dados da aplicação
export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
