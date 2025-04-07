import React, { createContext, useState, useContext, useEffect } from 'react';
import { Customer, Product, Order, Payment, RouteStop, DeliveryRoute, Vehicle, Load, SalesRep, Backup } from '@/types';
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
          
          // We need to ensure vehicle types are properly cast to the union type
          const validVehicles = (parsedData.vehicles || mockVehicles || []).map((vehicle: any) => ({
            ...vehicle,
            // Ensure the type is one of the allowed values
            type: (vehicle.type === 'car' || vehicle.type === 'van' || 
                   vehicle.type === 'truck' || vehicle.type === 'motorcycle') 
                  ? vehicle.type as "car" | "van" | "truck" | "motorcycle"
                  : "truck" // Default to truck if invalid type
          }));
          
          setVehicles(validVehicles);
        }
      } catch (e) {
        console.error('Error loading data from localStorage:', e);
        // Fallback to mock data with proper type validation
        const validVehicles = (mockVehicles || []).map((vehicle: any) => ({
          ...vehicle,
          // Ensure the type is one of the allowed values
          type: (vehicle.type === 'car' || vehicle.type === 'van' || 
                 vehicle.type === 'truck' || vehicle.type === 'motorcycle') 
                ? vehicle.type as "car" | "van" | "truck" | "motorcycle"
                : "truck" // Default to truck if invalid type
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
    } else {
      // Use mock data if nothing in localStorage
      setCustomers(mockCustomers);
      setProducts(mockProducts);
      setOrders(mockOrders);
      setPayments(mockPayments);
      setRoutes(mockRoutes);
      setLoads(mockLoads);
      setSalesReps(mockSalesReps);
      
      // Ensure vehicle types are properly cast
      const validVehicles = (mockVehicles || []).map((vehicle: any) => ({
        ...vehicle,
        type: (vehicle.type === 'car' || vehicle.type === 'van' || 
               vehicle.type === 'truck' || vehicle.type === 'motorcycle') 
              ? vehicle.type as "car" | "van" | "truck" | "motorcycle"
              : "truck"
      }));
      
      setVehicles(validVehicles);
    }
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
    loadData,
    saveData,
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
