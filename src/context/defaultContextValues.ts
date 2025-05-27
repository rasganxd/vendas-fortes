import { AppContextType } from './AppContextTypes';

const defaultContextValues: AppContextType = {
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
  connectionStatus: 'offline',
  isUsingMockData: false,
  
  isLoadingCustomers: false,
  isLoadingProducts: false,
  isLoadingOrders: false,
  isLoadingPayments: false,
  isLoadingRoutes: false,
  isLoadingLoads: false,
  isLoadingSalesReps: false,
  isLoadingVehicles: false,
  isLoadingPaymentMethods: false,
  isLoadingPaymentTables: false,
  isLoadingProductGroups: false,
  isLoadingProductCategories: false,
  isLoadingProductBrands: false,
  isLoadingDeliveryRoutes: false,
  isLoadingBackups: false,
  
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
  
  // Customer operations
  addCustomer: async () => '',
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  generateNextCustomerCode: async () => 1,
  
  // Product operations
  addProduct: async () => '',
  updateProduct: async () => {},
  deleteProduct: async () => {},
  validateProductDiscount: () => true,
  getMinimumPrice: () => 0,
  addBulkProducts: async () => [],
  
  // Order operations
  getOrderById: async () => null,
  addOrder: async () => '',
  updateOrder: async () => '', // Fixed: return Promise<string> instead of Promise<void>
  deleteOrder: async () => {},
  
  // Route operations
  addRoute: async () => '',
  updateRoute: async () => {},
  deleteRoute: async () => {},
  
  // Load operations
  addLoad: async () => '',
  updateLoad: async () => {},
  deleteLoad: async () => {},
  
  // Sales rep operations
  addSalesRep: async () => '',
  updateSalesRep: async () => {},
  deleteSalesRep: async () => {},
  
  // Vehicle operations
  addVehicle: async () => '',
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  
  // Payment operations
  addPayment: async () => '',
  updatePayment: async () => {},
  deletePayment: async () => {},
  createAutomaticPaymentRecord: async () => '',
  
  // Payment method operations
  addPaymentMethod: async () => '',
  updatePaymentMethod: async () => {},
  deletePaymentMethod: async () => {},
  
  // Payment table operations
  addPaymentTable: async () => '',
  updatePaymentTable: async () => {},
  deletePaymentTable: async () => {},
  
  // Product group operations
  addProductGroup: async () => '',
  updateProductGroup: async () => {},
  deleteProductGroup: async () => {},
  
  // Product category operations
  addProductCategory: async () => '',
  updateProductCategory: async () => {},
  deleteProductCategory: async () => {},
  
  // Product brand operations
  addProductBrand: async () => '',
  updateProductBrand: async () => {},
  deleteProductBrand: async () => {},
  
  // Delivery route operations
  addDeliveryRoute: async () => '',
  updateDeliveryRoute: async () => {},
  deleteDeliveryRoute: async () => {},
  
  // Backup operations
  createBackup: async () => '',
  restoreBackup: async () => false,
  deleteBackup: async () => false,
  
  // Settings - Fixed structure
  settings: {
    id: '',
    company: {
      name: 'Minha Empresa',
      address: '',
      phone: '',
      email: '',
      document: '',
      footer: ''
    },
    theme: {
      primaryColor: '#3b82f6'
    }
  },
  updateSettings: async () => {},
  
  // System operations
  startNewMonth: async () => false,
  startNewDay: async () => false,
  clearCache: async () => {},
  refreshData: async () => false,
  
  // Route specific operations
  generateRouteUpdate: async () => 0,
  getRouteWithCustomers: async () => null
};

export default defaultContextValues;
