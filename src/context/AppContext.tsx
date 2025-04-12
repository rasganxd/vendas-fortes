
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
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  routes: Route[];
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
  settings: AppSettings | null;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType>({
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
  settings: null,
  updateSettings: async () => false,
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  
  const { 
    customers, 
    isLoading: isLoadingCustomers 
  } = useCustomers();
  const { 
    products, 
    isLoading: isLoadingProducts 
  } = useProducts();
  const { 
    orders, 
    isLoading: isLoadingOrders 
  } = useOrders();
  const { 
    payments, 
    isLoading: isLoadingPayments 
  } = usePayments();
  const { 
    routes, 
    isLoading: isLoadingRoutes 
  } = useRoutes();
  const { 
    loads, 
    isLoading: isLoadingLoads 
  } = useLoads();
  const { 
    salesReps, 
    isLoading: isLoadingSalesReps 
  } = useSalesReps();
  const { 
    vehicles, 
    isLoading: isLoadingVehicles 
  } = useVehicles();
  const { 
    paymentTables, 
    isLoading: isLoadingPaymentTables 
  } = usePaymentTables();
  const {
    backups,
    isLoading: isLoadingBackups
  } = useBackups();
  
  const { 
    settings,
    updateSettings,
    isLoading: isLoadingSettings
  } = useAppSettings();
  
  const isLoading = isLoadingCustomers || isLoadingProducts || isLoadingOrders || isLoadingPayments || isLoadingRoutes || isLoadingLoads || isLoadingSalesReps || isLoadingVehicles || isLoadingPaymentTables || isLoadingBackups || isLoadingSettings;

  return (
    <AppContext.Provider
      value={{
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
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
