
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
  
  addCustomer: async () => '',
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  generateNextCustomerCode: async () => 1,
  
  addProduct: async () => '',
  updateProduct: async () => {},
  deleteProduct: async () => {},
  validateProductDiscount: () => true,
  getMinimumPrice: () => 0,
  addBulkProducts: async () => [],
  batchUpdateProducts: async () => ({ success: 0, failed: [] }),
  
  getOrderById: async () => null,
  addOrder: async () => '',
  updateOrder: async () => '',
  deleteOrder: async () => {},
  
  addRoute: async () => '',
  updateRoute: async () => {},
  deleteRoute: async () => {},
  
  addLoad: async () => '',
  updateLoad: async () => {},
  deleteLoad: async () => {},
  
  addSalesRep: async () => '',
  updateSalesRep: async () => {},
  deleteSalesRep: async () => {},
  
  addVehicle: async () => '',
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  
  addPayment: async () => '',
  updatePayment: async () => {},
  deletePayment: async () => {},
  createAutomaticPaymentRecord: async () => {}, // Fixed: returns Promise<void>
  
  addPaymentMethod: async () => '',
  updatePaymentMethod: async () => {},
  deletePaymentMethod: async () => {},
  
  addPaymentTable: async () => '',
  updatePaymentTable: async () => {},
  deletePaymentTable: async () => {},
  
  addProductGroup: async () => '',
  updateProductGroup: async () => {},
  deleteProductGroup: async () => {},
  
  addProductCategory: async () => '',
  updateProductCategory: async () => {},
  deleteProductCategory: async () => {},
  
  addProductBrand: async () => '',
  updateProductBrand: async () => {},
  deleteProductBrand: async () => {},
  
  addDeliveryRoute: async () => '',
  updateDeliveryRoute: async () => {},
  deleteDeliveryRoute: async () => {},
  
  createBackup: async () => '',
  restoreBackup: async () => false,
  deleteBackup: async () => false,
  
  settings: {
    id: 'default',
    company: {
      name: 'Minha Empresa',
      address: '',
      phone: '',
      email: '',
      document: '',
      footer: ''
    },
    theme: {
      primaryColor: '#6B7280'
    }
  },
  updateSettings: async () => {},
  
  startNewMonth: async () => false,
  startNewDay: async () => false,
  clearCache: async () => {},
  refreshData: async () => false,
  
  generateRouteUpdate: async () => 0,
  getRouteWithCustomers: async () => null
};

export default defaultContextValues;
