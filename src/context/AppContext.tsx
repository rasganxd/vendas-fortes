
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Customer, Product, Order, Payment, RouteStop, DeliveryRoute, Vehicle, Load, SalesRep, Backup, PaymentMethod } from '@/types';
import { mockCustomers, mockProducts, mockOrders, mockPayments, mockRoutes, mockLoads, mockSalesReps, mockVehicles } from '@/data/mock-data';
import { toast } from '@/components/ui/use-toast';

// Import dos hooks
import { loadCustomers } from '@/hooks/useCustomers';
import { loadProducts } from '@/hooks/useProducts';
import { loadOrders } from '@/hooks/useOrders';
import { loadVehicles } from '@/hooks/useVehicles';
import { loadPayments } from '@/hooks/usePayments';
import { loadRoutes } from '@/hooks/useRoutes';
import { loadLoads } from '@/hooks/useLoads';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useVehicles } from '@/hooks/useVehicles';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useBackups } from '@/hooks/useBackups';

// Exportando interface NavItem para SideNav
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

interface AppContextProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  routes: DeliveryRoute[];
  setRoutes: (routes: DeliveryRoute[]) => void;
  loads: Load[];
  setLoads: (loads: Load[]) => void;
  salesReps: SalesRep[];
  setSalesReps: (salesReps: SalesRep[]) => void;
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  backups: Backup[];
  setBackups: (backups: Backup[]) => void;
  
  // CRUD operations
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  addLoad: (load: Omit<Load, 'id'>) => Promise<string>;
  updateLoad: (id: string, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
  
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => string;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => void;
  deleteSalesRep: (id: string) => void;
  
  createBackup: (name: string, description?: string) => string;
  restoreBackup: (id: string) => void;
  deleteBackup: (id: string) => void;
  
  startNewDay: () => void;
  startNewMonth: () => void;
  
  loadData: () => void;
  saveData: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Função para gerar IDs únicos
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  // Função para carregar dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Tenta carregar do Firebase
      const customersData = await loadCustomers();
      const productsData = await loadProducts();
      const ordersData = await loadOrders();
      const vehiclesData = await loadVehicles();
      const paymentsData = await loadPayments();
      const routesData = await loadRoutes();
      const loadsData = await loadLoads();
      
      setCustomers(customersData.length > 0 ? customersData : mockCustomers);
      setProducts(productsData.length > 0 ? productsData : mockProducts);
      setOrders(ordersData.length > 0 ? ordersData : mockOrders);
      setVehicles(vehiclesData.length > 0 ? vehiclesData : mockVehicles);
      setPayments(paymentsData.length > 0 ? paymentsData : mockPayments);
      setRoutes(routesData.length > 0 ? routesData : mockRoutes);
      setLoads(loadsData.length > 0 ? loadsData : mockLoads);
      
      // Para simplificar o exemplo, continuamos usando dados mockados para o restante
      setSalesReps(mockSalesReps);
      
    } catch (error) {
      console.error("Erro ao carregar dados do Firebase:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Houve um problema ao carregar os dados do Firebase. Usando dados mockados.",
        variant: "destructive"
      });
      
      // Fallback para dados mockados
      setCustomers(mockCustomers);
      setProducts(mockProducts);
      setOrders(mockOrders);
      setPayments(mockPayments);
      setRoutes(mockRoutes);
      setLoads(mockLoads);
      setSalesReps(mockSalesReps);
      setVehicles(mockVehicles);
    } finally {
      setIsLoading(false);
    }
  };

  // Esta função não é mais necessária
  const saveData = () => {
    // Não fazemos mais nada aqui, pois o Firebase salva automaticamente
    console.log("Firebase salva automaticamente os dados");
  };

  // Inicializando os hooks
  const customersHook = useCustomers();
  const productsHook = useProducts();
  const ordersHook = useOrders();
  const paymentsHook = usePayments();
  const routesHook = useRoutes();
  const vehiclesHook = useVehicles();
  const loadsHook = useLoads();
  const salesRepsHook = useSalesReps();
  const backupsHook = useBackups();

  // Funções de utilidade para gerenciamento do sistema
  const startNewDay = () => {
    // Implementação para iniciar um novo dia de operações
    console.log("Iniciando novo dia de operações");
  };

  const startNewMonth = () => {
    // Implementação para iniciar um novo mês (pode incluir geração de relatórios, etc.)
    console.log("Iniciando novo mês de operações");
  };

  const value = {
    customers,
    setCustomers,
    products,
    setProducts,
    orders,
    setOrders,
    payments,
    setPayments,
    routes,
    setRoutes,
    loads,
    setLoads,
    salesReps,
    setSalesReps,
    vehicles,
    setVehicles,
    backups,
    setBackups,
    loadData,
    saveData,
    
    // Adicionar as funções CRUD dos hooks
    addCustomer: customersHook.addCustomer,
    updateCustomer: customersHook.updateCustomer,
    deleteCustomer: customersHook.deleteCustomer,
    
    addProduct: productsHook.addProduct,
    updateProduct: productsHook.updateProduct,
    deleteProduct: productsHook.deleteProduct,
    
    addOrder: ordersHook.addOrder,
    updateOrder: ordersHook.updateOrder,
    deleteOrder: ordersHook.deleteOrder,
    
    addPayment: paymentsHook.addPayment,
    updatePayment: paymentsHook.updatePayment,
    deletePayment: paymentsHook.deletePayment,
    
    addRoute: routesHook.addRoute,
    updateRoute: routesHook.updateRoute,
    deleteRoute: routesHook.deleteRoute,
    
    addVehicle: vehiclesHook.addVehicle,
    updateVehicle: vehiclesHook.updateVehicle,
    deleteVehicle: vehiclesHook.deleteVehicle,
    
    addLoad: loadsHook.addLoad,
    updateLoad: loadsHook.updateLoad,
    deleteLoad: loadsHook.deleteLoad,
    
    addSalesRep: salesRepsHook.addSalesRep,
    updateSalesRep: salesRepsHook.updateSalesRep,
    deleteSalesRep: salesRepsHook.deleteSalesRep,
    
    createBackup: backupsHook.createBackup,
    restoreBackup: backupsHook.restoreBackup,
    deleteBackup: backupsHook.deleteBackup,
    
    startNewDay,
    startNewMonth,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando dados...</div>;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
