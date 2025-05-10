import { Customer, Product, Order, Payment, Load, SalesRep, Vehicle, PaymentMethod, PaymentTable, ProductGroup, ProductCategory, ProductBrand, DeliveryRoute, Backup, AppSettings } from '@/types';

export interface AppContextType {
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
  isUsingMockData: boolean; // New field to track if using mock data
  
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
  
  // Products
  products: Product[];
  isLoadingProducts: boolean;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  validateProductDiscount: (productId: string, discountedPrice: number) => boolean;
  getMinimumPrice: (productId: string) => number;
  addBulkProducts: (products: Omit<Product, 'id'>[]) => Promise<string[]>; // Nova função
  
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
  clearCache: () => Promise<void>; // Added missing clearCache method
  
  // Added missing property for validateProductDiscount & getMinimumPrice
  createAutomaticPaymentRecord: (order: Order) => Promise<void>;
}
