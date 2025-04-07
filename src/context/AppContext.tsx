
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
  
  // Operações CRUD para todos os tipos de entidades
  // Customers
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Orders
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Payments
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  // Routes
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  // Vehicles
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // SalesReps
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;
  
  // Backups
  createBackup: (name: string, description?: string) => Promise<void>;
  restoreBackup: (id: string) => Promise<void>;
  deleteBackup: (id: string) => Promise<void>;
  
  // System management functions
  startNewDay: () => void;
  startNewMonth: () => void;
  loadData: () => void;
  saveData: () => void;
}

// Create and export the context itself
export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
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

  // Implementação das operações CRUD
  // Estas são implementações temporárias para corrigir os erros
  // Em uma refatoração completa, essas funções seriam movidas para seus respectivos hooks
  
  // Customers
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    // Implementação temporária
    console.log("Adding customer:", customer);
    return "temp-id";
  };
  
  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    // Implementação temporária
    console.log("Updating customer:", id, customer);
  };
  
  const deleteCustomer = async (id: string) => {
    // Implementação temporária
    console.log("Deleting customer:", id);
  };
  
  // Products
  const addProduct = async (product: Omit<Product, 'id'>) => {
    // Implementação temporária
    console.log("Adding product:", product);
    return "temp-id";
  };
  
  const updateProduct = async (id: string, product: Partial<Product>) => {
    // Implementação temporária
    console.log("Updating product:", id, product);
  };
  
  const deleteProduct = async (id: string) => {
    // Implementação temporária
    console.log("Deleting product:", id);
  };
  
  // Orders
  const addOrder = async (order: Omit<Order, 'id'>) => {
    // Implementação temporária
    console.log("Adding order:", order);
    return "temp-id";
  };
  
  const updateOrder = async (id: string, order: Partial<Order>) => {
    // Implementação temporária
    console.log("Updating order:", id, order);
  };
  
  const deleteOrder = async (id: string) => {
    // Implementação temporária
    console.log("Deleting order:", id);
  };
  
  // Payments
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    // Implementação temporária
    console.log("Adding payment:", payment);
    return "temp-id";
  };
  
  const updatePayment = async (id: string, payment: Partial<Payment>) => {
    // Implementação temporária
    console.log("Updating payment:", id, payment);
  };
  
  const deletePayment = async (id: string) => {
    // Implementação temporária
    console.log("Deleting payment:", id);
  };
  
  // Routes
  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    // Implementação temporária
    console.log("Adding route:", route);
    return "temp-id";
  };
  
  const updateRoute = async (id: string, route: Partial<DeliveryRoute>) => {
    // Implementação temporária
    console.log("Updating route:", id, route);
  };
  
  const deleteRoute = async (id: string) => {
    // Implementação temporária
    console.log("Deleting route:", id);
  };
  
  // Vehicles
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    // Implementação temporária
    console.log("Adding vehicle:", vehicle);
    return "temp-id";
  };
  
  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    // Implementação temporária
    console.log("Updating vehicle:", id, vehicle);
  };
  
  const deleteVehicle = async (id: string) => {
    // Implementação temporária
    console.log("Deleting vehicle:", id);
  };
  
  // SalesReps
  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    // Implementação temporária
    console.log("Adding salesRep:", salesRep);
    return "temp-id";
  };
  
  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    // Implementação temporária
    console.log("Updating salesRep:", id, salesRep);
  };
  
  const deleteSalesRep = async (id: string) => {
    // Implementação temporária
    console.log("Deleting salesRep:", id);
  };
  
  // Backups
  const createBackup = async (name: string, description?: string) => {
    // Implementação temporária
    console.log("Creating backup:", name, description);
  };
  
  const restoreBackup = async (id: string) => {
    // Implementação temporária
    console.log("Restoring backup:", id);
  };
  
  const deleteBackup = async (id: string) => {
    // Implementação temporária
    console.log("Deleting backup:", id);
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
    
    // CRUD operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    addPayment,
    updatePayment,
    deletePayment,
    addRoute,
    updateRoute,
    deleteRoute,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    createBackup,
    restoreBackup,
    deleteBackup,
    
    // System functions
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
