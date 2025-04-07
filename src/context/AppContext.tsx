import React, { createContext, useState, useContext, useEffect } from 'react';
import { Customer, Product, Order, Payment, RouteStop, DeliveryRoute, Vehicle, Load, SalesRep, Backup, PaymentMethod } from '@/types';
import { mockCustomers, mockProducts, mockOrders, mockPayments, mockRoutes, mockLoads, mockSalesReps, mockVehicles } from '@/data/mock-data';
import { customerService, productService, orderService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';

// Customer Types
// Product Types
// Order Types
// Payment Types
// Payment Method Types
// Route and Delivery Types
// Vehicle Types
// Load Types
// User/Sales Rep Types
// Backup Types
// Add NavItem export for SideNav
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
  
  // Operações de CRUD
  addCustomer: (customer: Omit<Customer, 'id'>) => string;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addOrder: (order: Omit<Order, 'id'>) => string;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  addPayment: (payment: Omit<Payment, 'id'>) => string;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => string;
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => void;
  deleteRoute: (id: string) => void;
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => string;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  addLoad: (load: Omit<Load, 'id'>) => string;
  updateLoad: (id: string, load: Partial<Load>) => void;
  deleteLoad: (id: string) => void;
  
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

  // Esta função agora carrega dados do Firebase
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Tenta carregar do Firebase
      const customersData = await customerService.getAll();
      const productsData = await productService.getAll();
      const ordersData = await orderService.getAll();
      
      setCustomers(customersData.length > 0 ? customersData : mockCustomers);
      setProducts(productsData.length > 0 ? productsData : mockProducts);
      setOrders(ordersData.length > 0 ? ordersData : mockOrders);
      
      // Para simplificar o exemplo, continuamos usando dados mockados para o restante
      setPayments(mockPayments);
      setRoutes(mockRoutes);
      setLoads(mockLoads);
      setSalesReps(mockSalesReps);
      setVehicles(mockVehicles);
      
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

  // Funções para gerar IDs únicos
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  // Implementações CRUD para Customer usando Firebase
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const id = await customerService.add(customer);
      const newCustomer = { ...customer, id } as Customer;
      setCustomers([...customers, newCustomer]);
      toast({
        title: "Cliente adicionado",
        description: "Cliente adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Houve um problema ao adicionar o cliente.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      await customerService.update(id, customer);
      const updatedCustomers = customers.map(c => 
        c.id === id ? { ...c, ...customer } : c
      );
      setCustomers(updatedCustomers);
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Houve um problema ao atualizar o cliente.",
        variant: "destructive"
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerService.delete(id);
      setCustomers(customers.filter(c => c.id !== id));
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Houve um problema ao excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  // Implementações para Product usando Firebase
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const id = await productService.add(product);
      const newProduct = { ...product, id };
      setProducts([...products, newProduct]);
      return id;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Houve um problema ao adicionar o produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await productService.update(id, product);
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...product } : p
      ));
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Houve um problema ao atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };

  // Implementações para Order usando Firebase
  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const id = await orderService.add(order);
      const newOrder = { ...order, id };
      setOrders([...orders, newOrder]);
      return id;
    } catch (error) {
      console.error("Erro ao adicionar pedido:", error);
      toast({
        title: "Erro ao adicionar pedido",
        description: "Houve um problema ao adicionar o pedido.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      await orderService.update(id, order);
      setOrders(orders.map(o => 
        o.id === id ? { ...o, ...order } : o
      ));
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: "Houve um problema ao atualizar o pedido.",
        variant: "destructive"
      });
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderService.delete(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      toast({
        title: "Erro ao excluir pedido",
        description: "Houve um problema ao excluir o pedido.",
        variant: "destructive"
      });
    }
  };

  // Para simplificar o exemplo, mantemos o restante das implementações usando a abordagem antiga
  // Implementações CRUD para Payment
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const id = generateId();
    const newPayment = { ...payment, id };
    setPayments([...payments, newPayment]);
    saveData();
    return id;
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, ...payment } : p
    ));
    saveData();
  };

  const deletePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
    saveData();
  };

  // Implementações CRUD para Route
  const addRoute = (route: Omit<DeliveryRoute, 'id'>) => {
    const id = generateId();
    const newRoute = { ...route, id };
    setRoutes([...routes, newRoute]);
    saveData();
    return id;
  };

  const updateRoute = (id: string, route: Partial<DeliveryRoute>) => {
    setRoutes(routes.map(r => 
      r.id === id ? { ...r, ...route } : r
    ));
    saveData();
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
    saveData();
  };

  // Implementações CRUD para Vehicle
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const id = generateId();
    const newVehicle = { ...vehicle, id };
    setVehicles([...vehicles, newVehicle]);
    saveData();
    return id;
  };

  const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, ...vehicle } : v
    ));
    saveData();
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    saveData();
  };

  // Implementações CRUD para Load
  const addLoad = (load: Omit<Load, 'id'>) => {
    const id = generateId();
    const newLoad = { ...load, id };
    setLoads([...loads, newLoad]);
    saveData();
    return id;
  };

  const updateLoad = (id: string, load: Partial<Load>) => {
    setLoads(loads.map(l => 
      l.id === id ? { ...l, ...load } : l
    ));
    saveData();
  };

  const deleteLoad = (id: string) => {
    setLoads(loads.filter(l => l.id !== id));
    saveData();
  };

  // Implementações CRUD para SalesRep
  const addSalesRep = (salesRep: Omit<SalesRep, 'id'>) => {
    const id = generateId();
    const newSalesRep = { ...salesRep, id };
    setSalesReps([...salesReps, newSalesRep]);
    saveData();
    return id;
  };

  const updateSalesRep = (id: string, salesRep: Partial<SalesRep>) => {
    setSalesReps(salesReps.map(s => 
      s.id === id ? { ...s, ...salesRep } : s
    ));
    saveData();
  };

  const deleteSalesRep = (id: string) => {
    setSalesReps(salesReps.filter(s => s.id !== id));
    saveData();
  };

  // Implementações para Backup
  const createBackup = (name: string, description?: string) => {
    const id = generateId();
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
        salesReps
      }
    };
    
    setBackups([...backups, newBackup]);
    saveData();
    return id;
  };

  const restoreBackup = (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return;
    
    setCustomers(backup.data.customers || []);
    setProducts(backup.data.products || []);
    setOrders(backup.data.orders || []);
    setPayments(backup.data.payments || []);
    setRoutes(backup.data.routes || []);
    setLoads(backup.data.loads || []);
    setSalesReps(backup.data.salesReps || []);
    
    saveData();
  };

  const deleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
    saveData();
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
    
    // Adicionar as funções CRUD
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
    addLoad,
    updateLoad,
    deleteLoad,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    createBackup,
    restoreBackup,
    deleteBackup,
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
