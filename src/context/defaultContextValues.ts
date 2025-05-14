
import { AppContextType } from './AppContextTypes';

export const defaultContextValues: AppContextType = {
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
  
  addCustomer: async () => "",
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  generateNextCustomerCode: () => 0,
  
  addProduct: async () => "",
  updateProduct: async () => {},
  deleteProduct: async () => {},
  validateProductDiscount: () => false,
  getMinimumPrice: () => 0,
  addBulkProducts: async () => [],
  
  getOrderById: async () => null,
  addOrder: async () => "",
  updateOrder: async () => "",
  deleteOrder: async () => {},
  
  addRoute: async () => "",
  updateRoute: async () => {},
  deleteRoute: async () => {},
  
  addLoad: async () => "",
  updateLoad: async () => {},
  deleteLoad: async () => {},
  
  addSalesRep: async () => "",
  updateSalesRep: async () => {},
  deleteSalesRep: async () => {},
  
  addVehicle: async () => "",
  updateVehicle: async () => {},
  deleteVehicle: async () => {},
  
  addPayment: async () => "",
  updatePayment: async () => {},
  deletePayment: async () => {},
  createAutomaticPaymentRecord: async () => "",
  
  addPaymentMethod: async () => "",
  updatePaymentMethod: async () => {},
  deletePaymentMethod: async () => {},
  
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
  
  createBackup: async () => "",
  restoreBackup: async () => Promise.resolve(false),
  deleteBackup: async () => Promise.resolve(false),
  
  settings: {
    companyName: "",
    companyDocument: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    companyFooter: "",
    primaryColor: "#1C64F2",
    secondaryColor: "#047481",
    accentColor: "#0694A2"
  },
  updateSettings: async () => {},
  
  startNewMonth: async () => Promise.resolve(true),
  clearCache: async () => {},
  refreshData: async () => Promise.resolve(true)
};
