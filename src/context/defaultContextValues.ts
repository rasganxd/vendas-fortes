
import { AppContextType } from './AppContextTypes';

// Default empty implementation of the AppContext
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
  connectionStatus: 'online',
  
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
  isUsingMockData: false,
  
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
  generateNextCustomerCode: () => 1,
  
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
  updateOrder: async () => '',
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
  restoreBackup: async () => true,
  deleteBackup: async () => true,
  
  // Settings
  settings: {
    id: '',
    company: {
      name: '',
      address: '',
      phone: '',
      email: '',
      document: '',
      footer: ''
    },
    theme: {
      primaryColor: '',
      secondaryColor: '',
      accentColor: ''
    }
  },
  updateSettings: async () => {},
  
  // System operations
  startNewMonth: async () => true,
  clearCache: async () => {},
  refreshData: async () => true,
};

export default defaultContextValues;
