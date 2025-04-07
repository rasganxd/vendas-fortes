
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Customer, 
  Product, 
  Order, 
  Payment, 
  DeliveryRoute,
  Load,
  SalesRep 
} from '@/types';
import { 
  mockCustomers, 
  mockProducts, 
  mockOrders, 
  mockPayments, 
  mockRoutes,
  mockLoads,
  mockSalesReps
} from '@/services/mockData';
import { toast } from '@/components/ui/use-toast';

interface AppContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  routes: DeliveryRoute[];
  loads: Load[];
  salesReps: SalesRep[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => void;
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => void;
  deleteRoute: (id: string) => void;
  addLoad: (load: Omit<Load, 'id'>) => void;
  updateLoad: (id: string, load: Partial<Load>) => void;
  deleteLoad: (id: string) => void;
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => void;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => void;
  deleteSalesRep: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);

  // Initialize with mock data
  useEffect(() => {
    setCustomers(mockCustomers);
    setProducts(mockProducts);
    setOrders(mockOrders);
    setPayments(mockPayments);
    setRoutes(mockRoutes);
    setLoads(mockLoads);
    setSalesReps(mockSalesReps);
  }, []);

  // Customer CRUD operations
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = {
      ...customer,
      id: generateId(),
      createdAt: new Date()
    };
    setCustomers(prev => [...prev, newCustomer]);
    toast({
      title: "Cliente adicionado",
      description: `${newCustomer.name} foi adicionado com sucesso.`,
    });
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
    });
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso.",
      variant: "destructive"
    });
  };

  // Product CRUD operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: generateId()
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Produto adicionado",
      description: `${newProduct.name} foi adicionado com sucesso.`,
    });
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
    toast({
      title: "Produto atualizado",
      description: "As informações do produto foram atualizadas com sucesso.",
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Produto removido",
      description: "O produto foi removido com sucesso.",
      variant: "destructive"
    });
  };

  // Sales Rep CRUD operations
  const addSalesRep = (salesRep: Omit<SalesRep, 'id'>) => {
    const newSalesRep = {
      ...salesRep,
      id: generateId()
    };
    setSalesReps(prev => [...prev, newSalesRep]);
    toast({
      title: "Vendedor adicionado",
      description: `${newSalesRep.name} foi adicionado com sucesso.`,
    });
  };

  const updateSalesRep = (id: string, salesRep: Partial<SalesRep>) => {
    setSalesReps(prev => prev.map(s => s.id === id ? { ...s, ...salesRep } : s));
    toast({
      title: "Vendedor atualizado",
      description: "As informações do vendedor foram atualizadas com sucesso.",
    });
  };

  const deleteSalesRep = (id: string) => {
    setSalesReps(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Vendedor removido",
      description: "O vendedor foi removido com sucesso.",
      variant: "destructive"
    });
  };

  // Order CRUD operations
  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder = {
      ...order,
      id: generateId(),
      createdAt: new Date()
    };
    setOrders(prev => [...prev, newOrder]);
    toast({
      title: "Pedido criado",
      description: `Pedido para ${newOrder.customerName} criado com sucesso.`,
    });
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...order } : o));
    toast({
      title: "Pedido atualizado",
      description: "As informações do pedido foram atualizadas com sucesso.",
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    toast({
      title: "Pedido removido",
      description: "O pedido foi removido com sucesso.",
      variant: "destructive"
    });
  };

  // Payment CRUD operations
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = {
      ...payment,
      id: generateId()
    };
    setPayments(prev => [...prev, newPayment]);
    
    // Update order payment status
    const order = orders.find(o => o.id === payment.orderId);
    if (order) {
      const totalPaid = [...payments, newPayment]
        .filter(p => p.orderId === payment.orderId && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
      if (totalPaid >= order.total) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partial';
      }
      
      updateOrder(order.id, { paymentStatus });
    }
    
    toast({
      title: "Pagamento registrado",
      description: `Pagamento de ${payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso.`,
    });
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...payment } : p));
    toast({
      title: "Pagamento atualizado",
      description: "As informações do pagamento foram atualizadas com sucesso.",
    });
  };

  const deletePayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setPayments(prev => prev.filter(p => p.id !== id));
      
      // Update order payment status
      const order = orders.find(o => o.id === payment.orderId);
      if (order) {
        const remainingPayments = payments
          .filter(p => p.id !== id && p.orderId === payment.orderId && p.status === 'completed');
        
        const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
        if (totalPaid >= order.total) {
          paymentStatus = 'paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'partial';
        }
        
        updateOrder(order.id, { paymentStatus });
      }
      
      toast({
        title: "Pagamento removido",
        description: "O registro de pagamento foi removido com sucesso.",
        variant: "destructive"
      });
    }
  };

  // Route CRUD operations
  const addRoute = (route: Omit<DeliveryRoute, 'id'>) => {
    const newRoute = {
      ...route,
      id: generateId()
    };
    setRoutes(prev => [...prev, newRoute]);
    toast({
      title: "Rota criada",
      description: `${newRoute.name} foi criada com sucesso.`,
    });
  };

  const updateRoute = (id: string, route: Partial<DeliveryRoute>) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, ...route } : r));
    toast({
      title: "Rota atualizada",
      description: "As informações da rota foram atualizadas com sucesso.",
    });
  };

  const deleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Rota removida",
      description: "A rota foi removida com sucesso.",
      variant: "destructive"
    });
  };

  // Load CRUD operations
  const addLoad = (load: Omit<Load, 'id'>) => {
    const newLoad = {
      ...load,
      id: generateId()
    };
    setLoads(prev => [...prev, newLoad]);
    toast({
      title: "Carga criada",
      description: `${newLoad.name} foi criada com sucesso.`,
    });
  };

  const updateLoad = (id: string, load: Partial<Load>) => {
    setLoads(prev => prev.map(l => l.id === id ? { ...l, ...load } : l));
    toast({
      title: "Carga atualizada",
      description: "As informações da carga foram atualizadas com sucesso.",
    });
  };

  const deleteLoad = (id: string) => {
    setLoads(prev => prev.filter(l => l.id !== id));
    toast({
      title: "Carga removida",
      description: "A carga foi removida com sucesso.",
      variant: "destructive"
    });
  };

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
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addSalesRep,
        updateSalesRep,
        deleteSalesRep,
        addOrder,
        updateOrder,
        deleteOrder,
        addPayment,
        updatePayment,
        deletePayment,
        addRoute,
        updateRoute,
        deleteRoute,
        addLoad,
        updateLoad,
        deleteLoad
      }}
    >
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
