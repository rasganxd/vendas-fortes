import React, { createContext, useEffect, useState } from 'react';
import { Customer, Product, Order, Payment, DeliveryRoute, Load, SalesRep, Vehicle, PaymentTable, Backup, PaymentMethod } from '@/types';
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
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  backups: Backup[];
  setBackups: React.Dispatch<React.SetStateAction<Backup[]>>;
  isLoading: boolean;
  
  // Route operations
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  deleteRoute: (id: string) => Promise<boolean>;
  
  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (id: string) => Promise<boolean>;
  
  // SalesRep operations
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<boolean>;
  deleteSalesRep: (id: string) => Promise<boolean>;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Payment operations
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  
  // PaymentMethod operations
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => Promise<string>;
  updatePaymentMethod: (id: string, paymentMethod: Partial<PaymentMethod>) => Promise<boolean>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  
  // Backup operations
  createBackup: (name: string, description?: string) => string;
  restoreBackup: (id: string) => boolean;
  deleteBackup: (id: string) => boolean;
  startNewMonth: () => void;
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Route operations
  const updateRoute = async (id: string, route: Partial<DeliveryRoute>) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, ...route } : r));
  };

  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    setRoutes([...routes, { ...route, id }]);
    return id;
  };

  const deleteRoute = async (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
    return true;
  };

  // Vehicle operations
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    setVehicles([...vehicles, { ...vehicle, id }]);
    return id;
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, ...vehicle } : v));
    return true;
  };

  const deleteVehicle = async (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    return true;
  };

  // SalesRep operations
  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    setSalesReps([...salesReps, { ...salesRep, id }]);
    return id;
  };

  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    setSalesReps(salesReps.map(s => s.id === id ? { ...s, ...salesRep } : s));
    return true;
  };

  const deleteSalesRep = async (id: string) => {
    setSalesReps(salesReps.filter(s => s.id !== id));
    return true;
  };

  // Product operations
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    setProducts([...products, { ...product, id }]);
    return id;
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...product } : p));
    return true;
  };

  const deleteProduct = async (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    return true;
  };

  // Payment operations
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    setPayments([...payments, { ...payment, id }]);
    return id;
  };

  // PaymentMethod operations
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    setPaymentMethods([...paymentMethods, { ...paymentMethod, id }]);
    return id;
  };

  const updatePaymentMethod = async (id: string, paymentMethod: Partial<PaymentMethod>) => {
    setPaymentMethods(methods => methods.map(m => m.id === id ? { ...m, ...paymentMethod } : m));
    return true;
  };

  const deletePaymentMethod = async (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
    return true;
  };

  // Backup operations
  const createBackup = (name: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newBackup: Backup = {
      id,
      name,
      description,
      date: new Date(),
      data: {
        customers,
        products,
        orders,
        payments,
        routes,
        loads,
        salesReps,
        vehicles
      }
    };
    setBackups([...backups, newBackup]);
    return id;
  };

  const restoreBackup = (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return false;
    
    setCustomers(backup.data.customers || []);
    setProducts(backup.data.products || []);
    setOrders(backup.data.orders || []);
    setPayments(backup.data.payments || []);
    setRoutes(backup.data.routes || []);
    setLoads(backup.data.loads || []);
    setSalesReps(backup.data.salesReps || []);
    if (backup.data.vehicles) {
      setVehicles(backup.data.vehicles);
    }
    
    return true;
  };

  const deleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
    return true;
  };

  const startNewMonth = () => {
    console.log("Starting new month");
  };

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      
      try {
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
        
        setCustomers(customersData);
        setProducts(productsData);
        setOrders(ordersData);
        setPayments(paymentsData);
        setRoutes(routesData);
        setLoads(loadsData);
        setSalesReps(salesRepsData);
        setVehicles(vehiclesData);
        setPaymentTables(paymentTablesData);
        
        setPaymentMethods([
          { id: '1', name: 'Dinheiro', type: 'cash', active: true },
          { id: '2', name: 'Cartão de Crédito', type: 'credit', active: true },
          { id: '3', name: 'Cartão de Débito', type: 'debit', active: true },
          { id: '4', name: 'Transferência', type: 'transfer', active: true },
          { id: '5', name: 'Cheque', type: 'check', active: true },
        ]);
        
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
      paymentMethods, setPaymentMethods,
      backups, setBackups,
      isLoading,
      updateRoute,
      addRoute,
      deleteRoute,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addSalesRep,
      updateSalesRep,
      deleteSalesRep,
      addProduct,
      updateProduct,
      deleteProduct,
      addPayment,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      createBackup,
      restoreBackup,
      deleteBackup,
      startNewMonth
    }}>
      {children}
    </AppContext.Provider>
  );
};
