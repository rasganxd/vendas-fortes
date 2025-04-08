import React, { createContext, useState, useEffect } from 'react';
import { Customer, Product, Order, Payment, DeliveryRoute, Vehicle, Load, SalesRep, Backup } from '@/types';
import { mockCustomers, mockProducts, mockOrders, mockVehicles, mockPayments, mockRoutes, mockLoads, mockSalesReps } from '@/data/mock-data';
import { toast } from '@/components/ui/use-toast';

import { 
  customerService,
  productService,
  orderService,
  vehicleService,
  paymentService,
  routeService,
  loadService
} from '@/firebase/firestoreService';

const loadCustomersData = async (): Promise<Customer[]> => {
  try {
    return await customerService.getAll();
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return mockCustomers; // Fallback to mock data
  }
};

const loadProductsData = async (): Promise<Product[]> => {
  try {
    return await productService.getAll();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return mockProducts;
  }
};

const loadOrdersData = async (): Promise<Order[]> => {
  try {
    return await orderService.getAll();
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    return mockOrders;
  }
};

const loadVehiclesData = async (): Promise<Vehicle[]> => {
  try {
    return await vehicleService.getAll();
  } catch (error) {
    console.error("Erro ao carregar veículos:", error);
    return mockVehicles;
  }
};

const loadPaymentsData = async (): Promise<Payment[]> => {
  try {
    return await paymentService.getAll();
  } catch (error) {
    console.error("Erro ao carregar pagamentos:", error);
    return mockPayments;
  }
};

const loadRoutesData = async (): Promise<DeliveryRoute[]> => {
  try {
    return await routeService.getAll();
  } catch (error) {
    console.error("Erro ao carregar rotas:", error);
    return mockRoutes;
  }
};

const loadLoadsData = async (): Promise<Load[]> => {
  try {
    return await loadService.getAll();
  } catch (error) {
    console.error("Erro ao carregar cargas:", error);
    return mockLoads;
  }
};

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
  
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;
  
  createBackup: (name: string, description?: string) => Promise<void>;
  restoreBackup: (id: string) => Promise<void>;
  deleteBackup: (id: string) => Promise<void>;
  
  startNewDay: () => void;
  startNewMonth: () => void;
  loadData: () => void;
  saveData: () => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const customersData = await loadCustomersData();
      const productsData = await loadProductsData();
      const ordersData = await loadOrdersData();
      const vehiclesData = await loadVehiclesData();
      const paymentsData = await loadPaymentsData();
      const routesData = await loadRoutesData();
      const loadsData = await loadLoadsData();
      
      // Ensure all customers have a code
      const customersWithCode = customersData.map((customer, index) => {
        if (customer.code === undefined) {
          return { ...customer, code: index + 1 };
        }
        return customer;
      });

      // Ensure all salesReps have a code
      const salesRepsWithCode = mockSalesReps.map((rep, index) => {
        if (rep.code === undefined) {
          return { ...rep, code: index + 1 };
        }
        return rep;
      });
      
      setCustomers(customersWithCode);
      setProducts(productsData);
      setOrders(ordersData);
      setVehicles(vehiclesData);
      setPayments(paymentsData);
      setRoutes(routesData);
      setLoads(loadsData);
      
      setSalesReps(salesRepsWithCode);
      
      console.log('Dados carregados do Firebase:', {
        customers: customersWithCode.length,
        products: productsData.length, 
        orders: ordersData.length,
        vehicles: vehiclesData.length,
        payments: paymentsData.length,
        routes: routesData.length,
        loads: loadsData.length
      });
    } catch (error) {
      console.error("Erro ao carregar dados do Firebase:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Houve um problema ao carregar os dados do Firebase.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = () => {
    console.log("Firebase salva automaticamente os dados");
  };

  const generateNextCustomerCode = (): number => {
    if (customers.length === 0) return 1;
    
    const highestCode = customers.reduce(
      (max, customer) => (customer.code && customer.code > max ? customer.code : max), 
      0
    );
    
    return highestCode + 1;
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      if (!customer.code) {
        customer.code = generateNextCustomerCode();
      }
      
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

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const id = await productService.add(product);
      const newProduct = { ...product, id };
      setProducts([...products, newProduct]);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
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
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
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
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const id = await orderService.add(order);
      const newOrder = { ...order, id };
      setOrders([...orders, newOrder]);
      toast({
        title: "Pedido adicionado",
        description: "Pedido adicionado com sucesso!"
      });
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
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
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
      toast({
        title: "Pedido excluído",
        description: "Pedido excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      toast({
        title: "Erro ao excluir pedido",
        description: "Houve um problema ao excluir o pedido.",
        variant: "destructive"
      });
    }
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const id = await paymentService.add(payment);
      const newPayment = { ...payment, id };
      setPayments([...payments, newPayment]);
      toast({
        title: "Pagamento adicionado",
        description: "Pagamento adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error);
      toast({
        title: "Erro ao adicionar pagamento",
        description: "Houve um problema ao adicionar o pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updatePayment = async (id: string, payment: Partial<Payment>) => {
    try {
      await paymentService.update(id, payment);
      setPayments(payments.map(p => 
        p.id === id ? { ...p, ...payment } : p
      ));
      toast({
        title: "Pagamento atualizado",
        description: "Pagamento atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Houve um problema ao atualizar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await paymentService.delete(id);
      setPayments(payments.filter(p => p.id !== id));
      toast({
        title: "Pagamento excluído",
        description: "Pagamento excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error);
      toast({
        title: "Erro ao excluir pagamento",
        description: "Houve um problema ao excluir o pagamento.",
        variant: "destructive"
      });
    }
  };

  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await routeService.add(route);
      const newRoute = { ...route, id } as DeliveryRoute;
      setRoutes([...routes, newRoute]);
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar rota:", error);
      toast({
        title: "Erro ao adicionar rota",
        description: "Houve um problema ao adicionar a rota.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateRoute = async (id: string, route: Partial<DeliveryRoute>) => {
    try {
      await routeService.update(id, route);
      setRoutes(routes.map(r => 
        r.id === id ? { ...r, ...route } : r
      ));
      toast({
        title: "Rota atualizada",
        description: "Rota atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar rota:", error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota.",
        variant: "destructive"
      });
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await routeService.delete(id);
      setRoutes(routes.filter(r => r.id !== id));
      toast({
        title: "Rota excluída",
        description: "Rota excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      toast({
        title: "Erro ao excluir rota",
        description: "Houve um problema ao excluir a rota.",
        variant: "destructive"
      });
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const id = await vehicleService.add(vehicle);
      const newVehicle = { ...vehicle, id };
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      toast({
        title: "Erro ao adicionar veículo",
        description: "Houve um problema ao adicionar o veículo.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      await vehicleService.update(id, vehicle);
      setVehicles(vehicles.map(v => 
        v.id === id ? { ...v, ...vehicle } : v
      ));
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      toast({
        title: "Erro ao atualizar veículo",
        description: "Houve um problema ao atualizar o veículo.",
        variant: "destructive"
      });
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await vehicleService.delete(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({
        title: "Veículo excluído",
        description: "Veículo excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      toast({
        title: "Erro ao excluir veículo",
        description: "Houve um problema ao excluir o veículo.",
        variant: "destructive"
      });
    }
  };

  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    console.log("Adding salesRep:", salesRep);
    return "temp-id";
  };

  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    console.log("Updating salesRep:", id, salesRep);
  };

  const deleteSalesRep = async (id: string) => {
    console.log("Deleting salesRep:", id);
  };

  const createBackup = async (name: string, description?: string) => {
    console.log("Creating backup:", name, description);
  };

  const restoreBackup = async (id: string) => {
    console.log("Restoring backup:", id);
  };

  const deleteBackup = async (id: string) => {
    console.log("Deleting backup:", id);
  };

  const startNewDay = () => {
    console.log("Iniciando novo dia de operações");
  };

  const startNewMonth = () => {
    console.log("Iniciando novo mês de operações");
  };

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
