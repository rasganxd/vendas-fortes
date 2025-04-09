
import React, { createContext, useEffect, useState } from 'react';
import { Customer, Product, Order, Payment, DeliveryRoute, Load, SalesRep, Vehicle, PaymentTable } from '@/types';
import { loadCustomers } from '@/hooks/useCustomers';
import { loadProducts } from '@/hooks/useProducts';
import { loadOrders } from '@/hooks/useOrders';
import { loadPayments } from '@/hooks/usePayments';
import { loadRoutes } from '@/hooks/useRoutes';
import { loadLoads } from '@/hooks/useLoads';
import { loadSalesReps } from '@/hooks/useSalesReps';
import { loadVehicles } from '@/hooks/useVehicles';
import { loadPaymentTables } from '@/hooks/usePaymentTables';

// Interface for the context
interface AppContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  routes: DeliveryRoute[];
  setRoutes: React.Dispatch<React.SetStateAction<DeliveryRoute[]>>;
  loads: Load[];
  setLoads: React.Dispatch<React.SetStateAction<Load[]>>;
  salesReps: SalesRep[];
  setSalesReps: React.Dispatch<React.SetStateAction<SalesRep[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  paymentTables: PaymentTable[];
  setPaymentTables: React.Dispatch<React.SetStateAction<PaymentTable[]>>;
  isLoading: boolean;
}

// Create the context
export const AppContext = createContext<AppContextType | null>(null);

// Provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [paymentTables, setPaymentTables] = useState<PaymentTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      
      try {
        // Carrega todos os dados do Firestore
        const [
          customersData, 
          productsData, 
          ordersData, 
          paymentsData, 
          routesData,
          loadsData,
          salesRepsData,
          vehiclesData,
          paymentTablesData
        ] = await Promise.all([
          loadCustomers(),
          loadProducts(),
          loadOrders(),
          loadPayments(),
          loadRoutes(),
          loadLoads(),
          loadSalesReps(),
          loadVehicles(),
          loadPaymentTables()
        ]);
        
        // Atualiza os estados com os dados carregados
        setCustomers(customersData);
        setProducts(productsData);
        setOrders(ordersData);
        setPayments(paymentsData);
        setRoutes(routesData);
        setLoads(loadsData);
        setSalesReps(salesRepsData);
        setVehicles(vehiclesData);
        setPaymentTables(paymentTablesData);
        
        console.log('Todos os dados foram carregados com sucesso!');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      customers, setCustomers, 
      products, setProducts,
      orders, setOrders,
      payments, setPayments,
      routes, setRoutes,
      loads, setLoads,
      salesReps, setSalesReps,
      vehicles, setVehicles,
      paymentTables, setPaymentTables,
      isLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};
