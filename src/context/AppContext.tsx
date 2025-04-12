import React, { createContext, useState } from 'react';
import { Customer, Product, Order, Payment, Route, Load, SalesRep, Vehicle, PaymentMethod, PaymentTable, ProductGroup, ProductCategory, ProductBrand, DeliveryRoute, Backup, AppSettings } from '@/types';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { toast } from '@/components/ui/use-toast';

interface AppContextType {
  // Data arrays
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  routes: DeliveryRoute[];
  loads: Load[];
  salesReps: SalesRep[];
  vehicles: Vehicle[];
  paymentMethods: PaymentMethod[];
  paymentTables: PaymentTable[];
  productGroups: ProductGroup[];
  productCategories: ProductCategory[];
  productBrands: ProductBrand[];
  deliveryRoutes: DeliveryRoute[];
  backups: Backup[];
  
  // Loading states
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isLoadingOrders: boolean;
  isLoadingPayments: boolean;
  isLoadingRoutes: boolean;
  isLoadingLoads: boolean;
  isLoadingSalesReps: boolean;
  isLoadingVehicles: boolean;
  isLoadingPaymentMethods: boolean;
  isLoadingPaymentTables: boolean;
  isLoadingProductGroups: boolean;
  isLoadingProductCategories: boolean;
  isLoadingProductBrands: boolean;
  isLoadingDeliveryRoutes: boolean;
  isLoadingBackups: boolean;
  
  // State setters
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setRoutes: React.Dispatch<React.SetStateAction<DeliveryRoute[]>>;
  setLoads: React.Dispatch<React.SetStateAction<Load[]>>;
  setSalesReps: React.Dispatch<React.SetStateAction<SalesRep[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  setPaymentTables: React.Dispatch<React.SetStateAction<PaymentTable[]>>;
  setProductGroups: React.Dispatch<React.SetStateAction<ProductGroup[]>>;
  setProductCategories: React.Dispatch<React.SetStateAction<ProductCategory[]>>;
  setProductBrands: React.Dispatch<React.SetStateAction<ProductBrand[]>>;
  setDeliveryRoutes: React.Dispatch<React.SetStateAction<DeliveryRoute[]>>;
  setBackups: React.Dispatch<React.SetStateAction<Backup[]>>;
  
  // Methods from hooks
  // Route operations
  addRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  generateNextCustomerCode: () => number;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Order operations
  getOrderById: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<string>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Payment operations
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  // PaymentMethod operations
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<string>;
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  
  // Load operations
  addLoad: (load: Omit<Load, 'id'>) => Promise<string>;
  updateLoad: (id: string, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
  
  // SalesRep operations
  addSalesRep: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  updateSalesRep: (id: string, salesRep: Partial<SalesRep>) => Promise<void>;
  deleteSalesRep: (id: string) => Promise<void>;
  
  // PaymentTable operations
  addPaymentTable: (paymentTable: Omit<PaymentTable, 'id'>) => Promise<string>;
  updatePaymentTable: (id: string, paymentTable: Partial<PaymentTable>) => Promise<void>;
  deletePaymentTable: (id: string) => Promise<void>;
  
  // ProductGroup operations
  addProductGroup: (group: Omit<ProductGroup, 'id'>) => Promise<string>;
  updateProductGroup: (id: string, group: Partial<ProductGroup>) => Promise<void>;
  deleteProductGroup: (id: string) => Promise<void>;
  
  // ProductCategory operations
  addProductCategory: (category: Omit<ProductCategory, 'id'>) => Promise<string>;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;
  
  // ProductBrand operations
  addProductBrand: (brand: Omit<ProductBrand, 'id'>) => Promise<string>;
  updateProductBrand: (id: string, brand: Partial<ProductBrand>) => Promise<void>;
  deleteProductBrand: (id: string) => Promise<void>;
  
  // DeliveryRoute operations
  addDeliveryRoute: (route: Omit<DeliveryRoute, 'id'>) => Promise<string>;
  updateDeliveryRoute: (id: string, route: Partial<DeliveryRoute>) => Promise<void>;
  deleteDeliveryRoute: (id: string) => Promise<void>;
  
  // Backup operations
  createBackup: (name: string, description?: string) => string;
  restoreBackup: (id: string) => boolean;
  deleteBackup: (id: string) => boolean;
  
  // App Settings
  settings: AppSettings | null;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<boolean>;
  
  // System operations
  startNewMonth: () => void;
}

export const AppContext = createContext<AppContextType>({
  // Default empty values for data arrays
  customers: [],
  products: [],
  orders: [],
  payments: [],
  routes: [],
  loads: [],
  salesReps: [],
  vehicles: [],
  paymentMethods: [],
  paymentTables: [],
  productGroups: [],
  productCategories: [],
  productBrands: [],
  deliveryRoutes: [],
  backups: [],
  
  // Default loading states
  isLoadingCustomers: true,
  isLoadingProducts: true,
  isLoadingOrders: true,
  isLoadingPayments: true,
  isLoadingRoutes: true,
  isLoadingLoads: true,
  isLoadingSalesReps: true,
  isLoadingVehicles: true,
  isLoadingPaymentMethods: true,
  isLoadingPaymentTables: true,
  isLoadingProductGroups: true,
  isLoadingProductCategories: true,
  isLoadingProductBrands: true,
  isLoadingDeliveryRoutes: true,
  isLoadingBackups: true,
  
  // Empty setters
  setCustomers: () => {},
  setProducts: () => {},
  setOrders: () => {},
  setPayments: () => {},
  setRoutes: () => {},
  setLoads: () => {},
  setSalesReps: () => {},
  setVehicles: () => {},
  setPaymentMethods: () => {},
  setPaymentTables: () => {},
  setProductGroups: () => {},
  setProductCategories: () => {},
  setProductBrands: () => {},
  setDeliveryRoutes: () => {},
  setBackups: () => {},
  
  // Empty method implementations
  addRoute: async () => "",
  updateRoute: async () => {},
  deleteRoute: async () => {},
  addCustomer: async () => "",
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  generateNextCustomerCode: () => 1,
  addProduct: async () => "",
  updateProduct: async () => {},
  deleteProduct: async () => {},
  getOrderById: () => undefined,
  addOrder: async () => "",
  updateOrder: async () => "",
  deleteOrder: async () => {},
  addVehicle: async () => "",
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  addPayment: async () => "",
  updatePayment: async () => {},
  deletePayment: async () => {},
  addPaymentMethod: async () => "",
  updatePaymentMethod: async () => {},
  deletePaymentMethod: async () => {},
  addLoad: async () => "",
  updateLoad: async () => {},
  deleteLoad: async () => {},
  addSalesRep: async () => "",
  updateSalesRep: async () => {},
  deleteSalesRep: async () => {},
  addPaymentTable: async () => "",
  updatePaymentTable: async () => {},
  deletePaymentTable: async () => {},
  addProductGroup: async () => "",
  updateProductGroup: async () => {},
  deleteProductGroup: async () => {},
  addProductCategory: async () => "",
  updateProductCategory: async () => {},
  deleteProductCategory: async () => {},
  addProductBrand: async () => "",
  updateProductBrand: async () => {},
  deleteProductBrand: async () => {},
  addDeliveryRoute: async () => "",
  updateDeliveryRoute: async () => {},
  deleteDeliveryRoute: async () => {},
  createBackup: () => "",
  restoreBackup: () => false,
  deleteBackup: () => false,
  settings: null,
  updateSettings: async () => false,
  startNewMonth: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // State hooks for all data types
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  
  // Hook calls
  const { 
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode: generateNextCustomerCode,
    isLoading: isLoadingCustomers,
    setCustomers
  } = useCustomers();
  
  const { 
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading: isLoadingProducts,
    setProducts
  } = useProducts();
  
  const { 
    orders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading: isLoadingOrders,
    setOrders
  } = useOrders();
  
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    isLoading: isLoadingPayments,
    setPayments
  } = usePayments();
  
  const {
    routes,
    addRoute,
    updateRoute,
    deleteRoute,
    isLoading: isLoadingRoutes,
    setRoutes
  } = useRoutes();
  
  const {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    isLoading: isLoadingLoads,
    setLoads
  } = useLoads();
  
  const {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    isLoading: isLoadingSalesReps,
    setSalesReps
  } = useSalesReps();
  
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    isLoading: isLoadingVehicles,
    setVehicles
  } = useVehicles();
  
  const {
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    isLoading: isLoadingPaymentTables,
    setPaymentTables
  } = usePaymentTables();
  
  const {
    productGroups: fetchedProductGroups,
    isLoading: isLoadingProductGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();
  
  const {
    productCategories: fetchedProductCategories,
    isLoading: isLoadingProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();
  
  const {
    productBrands: fetchedProductBrands,
    isLoading: isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();
  
  const {
    deliveryRoutes: fetchedDeliveryRoutes,
    isLoading: isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();
  
  const {
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  const { 
    settings,
    updateSettings,
    isLoading: isLoadingSettings
  } = useAppSettings();

  // Function to start a new month (archiving old data)
  const startNewMonth = () => {
    // Create a backup first
    const backupId = createBackup("Monthly Backup", "Backup created during month transition");
    
    // Archive old orders or perform other cleanup
    // This is a placeholder - actual implementation would depend on requirements
    console.log("Starting new month. Backup created with ID:", backupId);
    
    toast({
      title: "New month started",
      description: "A backup was created and the system is ready for a new month."
    });
  };

  return (
    <AppContext.Provider
      value={{
        // Data arrays
        customers,
        products,
        orders,
        payments,
        routes,
        loads,
        salesReps,
        vehicles,
        paymentMethods,
        paymentTables,
        productGroups: productGroups.length > 0 ? productGroups : fetchedProductGroups,
        productCategories: productCategories.length > 0 ? productCategories : fetchedProductCategories,
        productBrands: productBrands.length > 0 ? productBrands : fetchedProductBrands,
        deliveryRoutes: deliveryRoutes.length > 0 ? deliveryRoutes : fetchedDeliveryRoutes,
        backups,
        
        // Loading states
        isLoadingCustomers,
        isLoadingProducts,
        isLoadingOrders,
        isLoadingPayments,
        isLoadingRoutes,
        isLoadingLoads,
        isLoadingSalesReps,
        isLoadingVehicles,
        isLoadingPaymentMethods: false,
        isLoadingPaymentTables,
        isLoadingProductGroups,
        isLoadingProductCategories,
        isLoadingProductBrands,
        isLoadingDeliveryRoutes,
        isLoadingBackups,
        
        // State setters
        setCustomers,
        setProducts,
        setOrders,
        setPayments,
        setRoutes,
        setLoads,
        setSalesReps,
        setVehicles,
        setPaymentMethods,
        setPaymentTables,
        setProductGroups,
        setProductCategories,
        setProductBrands,
        setDeliveryRoutes,
        setBackups,
        
        // Methods
        addRoute,
        updateRoute,
        deleteRoute,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        generateNextCustomerCode,
        addProduct,
        updateProduct,
        deleteProduct,
        getOrderById,
        addOrder,
        updateOrder,
        deleteOrder,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addPayment,
        updatePayment,
        deletePayment,
        addPaymentMethod: async (method) => {
          const { addPaymentMethod } = usePaymentMethods();
          return addPaymentMethod(method);
        },
        updatePaymentMethod: async (id, method) => {
          const { updatePaymentMethod } = usePaymentMethods();
          await updatePaymentMethod(id, method);
        },
        deletePaymentMethod: async (id) => {
          const { deletePaymentMethod } = usePaymentMethods();
          await deletePaymentMethod(id);
        },
        addLoad,
        updateLoad,
        deleteLoad,
        addSalesRep,
        updateSalesRep,
        deleteSalesRep,
        addPaymentTable,
        updatePaymentTable,
        deletePaymentTable,
        addProductGroup,
        updateProductGroup,
        deleteProductGroup,
        addProductCategory,
        updateProductCategory,
        deleteProductCategory,
        addProductBrand,
        updateProductBrand,
        deleteProductBrand,
        addDeliveryRoute,
        updateDeliveryRoute,
        deleteDeliveryRoute,
        createBackup,
        restoreBackup,
        deleteBackup,
        settings,
        updateSettings,
        startNewMonth
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
