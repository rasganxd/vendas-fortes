
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Customer, Product, Order, Payment, RouteStop, DeliveryRoute, Vehicle, Load, SalesRep, Backup, PaymentMethod } from '@/types';
import { mockCustomers, mockProducts, mockOrders, mockPayments, mockRoutes, mockLoads, mockSalesReps, mockVehicles } from '@/data/mock-data';

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

  useEffect(() => {
    loadData();
  }, []);

  const saveData = () => {
    localStorage.setItem('salestrack-data', JSON.stringify({
      customers,
      products,
      orders,
      payments,
      routes,
      loads,
      salesReps,
      vehicles,
      backups
    }));
  };

  const loadData = () => {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('salestrack-data');
        if (data) {
          const parsedData = JSON.parse(data);
          
          setCustomers(parsedData.customers || mockCustomers);
          setProducts(parsedData.products || mockProducts);
          setOrders(parsedData.orders || mockOrders);
          setPayments(parsedData.payments || mockPayments);
          setRoutes(parsedData.routes || mockRoutes);
          setLoads(parsedData.loads || mockLoads);
          setSalesReps(parsedData.salesReps || mockSalesReps);
          setBackups(parsedData.backups || []);
          
          // Validar tipos de veículos
          const validVehicles = (parsedData.vehicles || mockVehicles || []).map((vehicle: any) => ({
            ...vehicle,
            // Garantir que o tipo está entre os valores permitidos
            type: (vehicle.type === 'car' || vehicle.type === 'van' || 
                   vehicle.type === 'truck' || vehicle.type === 'motorcycle') 
                  ? vehicle.type as "car" | "van" | "truck" | "motorcycle"
                  : "truck" // Valor padrão se inválido
          }));
          
          setVehicles(validVehicles);
        } else {
          // Usar dados mockados se não houver dados no localStorage
          setCustomers(mockCustomers);
          setProducts(mockProducts);
          setOrders(mockOrders);
          setPayments(mockPayments);
          setRoutes(mockRoutes);
          setLoads(mockLoads);
          setSalesReps(mockSalesReps);
          setVehicles(mockVehicles);
        }
      } catch (e) {
        console.error('Erro ao carregar dados do localStorage:', e);
        // Fallback para dados mockados com validação adequada
        const validVehicles = (mockVehicles || []).map((vehicle: any) => ({
          ...vehicle,
          // Garantir que o tipo está entre os valores permitidos
          type: (vehicle.type === 'car' || vehicle.type === 'van' || 
                 vehicle.type === 'truck' || vehicle.type === 'motorcycle') 
                ? vehicle.type as "car" | "van" | "truck" | "motorcycle"
                : "truck" // Valor padrão se inválido
        }));
        
        setCustomers(mockCustomers);
        setProducts(mockProducts);
        setOrders(mockOrders);
        setPayments(mockPayments);
        setRoutes(mockRoutes);
        setLoads(mockLoads);
        setSalesReps(mockSalesReps);
        setVehicles(validVehicles);
      }
    }
  };

  // Funções para gerar IDs únicos
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  // Implementações CRUD para Customer
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const id = generateId();
    const newCustomer = { ...customer, id };
    setCustomers([...customers, newCustomer as Customer]);
    saveData();
    return id;
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    const updatedCustomers = customers.map(c => 
      c.id === id ? { ...c, ...customer } : c
    );
    setCustomers(updatedCustomers);
    saveData();
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    saveData();
  };

  // Implementações CRUD para Product
  const addProduct = (product: Omit<Product, 'id'>) => {
    const id = generateId();
    const newProduct = { ...product, id };
    setProducts([...products, newProduct]);
    saveData();
    return id;
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...product } : p
    ));
    saveData();
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    saveData();
  };

  // Implementações CRUD para Order
  const addOrder = (order: Omit<Order, 'id'>) => {
    const id = generateId();
    const newOrder = { ...order, id };
    setOrders([...orders, newOrder]);
    saveData();
    return id;
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    setOrders(orders.map(o => 
      o.id === id ? { ...o, ...order } : o
    ));
    saveData();
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    saveData();
  };

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
