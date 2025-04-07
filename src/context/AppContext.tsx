
import React, { createContext, useState, useEffect } from 'react';
import { Customer, Product, Order, Payment, DeliveryRoute, Vehicle, Load, SalesRep, Backup } from '@/types';
import { mockCustomers, mockProducts, mockOrders, mockPayments, mockRoutes, mockLoads, mockSalesReps, mockVehicles } from '@/data/mock-data';
import { toast } from '@/components/ui/use-toast';

// Import load functions only (not hooks that would cause circular dependencies)
import { loadCustomers } from '@/hooks/useCustomers';
import { loadProducts } from '@/hooks/useProducts';
import { loadOrders } from '@/hooks/useOrders';
import { loadVehicles } from '@/hooks/useVehicles';
import { loadPayments } from '@/hooks/usePayments';
import { loadRoutes } from '@/hooks/useRoutes';
import { loadLoads } from '@/hooks/useLoads';

// Exportando interface NavItem para SideNav
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

export interface AppContextProps {
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
  
  // System management functions
  startNewDay: () => void;
  startNewMonth: () => void;
  loadData: () => void;
  saveData: () => void;
}

// Create and export the context itself
export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for all entities
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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

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

  // Funções de utilidade para gerenciamento do sistema
  const startNewDay = () => {
    // Implementação para iniciar um novo dia de operações
    console.log("Iniciando novo dia de operações");
  };

  const startNewMonth = () => {
    // Implementação para iniciar um novo mês (pode incluir geração de relatórios, etc.)
    console.log("Iniciando novo mês de operações");
  };

  // Create context value object
  const value: AppContextProps = {
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
