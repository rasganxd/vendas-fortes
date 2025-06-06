
import { AppContextType } from '../AppContextTypes';
import { customerOperations } from './dataLoading';

export const createAppOperations = (context: AppContextType) => {
  const { 
    products, 
    customers, 
    deliveryRoutes, 
    salesReps,
    vehicles,
    paymentMethods,
    paymentTables,
    orders,
    loads
  } = context;

  return {
    // Customer operations
    getCustomerById: customerOperations.getCustomerById(customers),
    findCustomerByCode: customerOperations.findCustomerByCode(customers),
    
    // Product operations
    getProductById: (id: string) => products.find(p => p.id === id),
    findProductByCode: (code: string) => products.find(p => p.code === code),
    
    // Sales rep operations
    getSalesRepById: (id: string) => salesReps.find(sr => sr.id === id),
    findSalesRepByCode: (code: number) => salesReps.find(sr => sr.code === code),
    
    // Vehicle operations  
    getVehicleById: (id: string) => vehicles.find(v => v.id === id),
    
    // Payment operations
    getPaymentMethodById: (id: string) => paymentMethods.find(pm => pm.id === id),
    getPaymentTableById: (id: string) => paymentTables.find(pt => pt.id === id),
    
    // Order operations
    getOrderById: (id: string) => orders.find(o => o.id === id),
    
    // Load operations
    getLoadById: (id: string) => loads.find(l => l.id === id),
    
    // Delivery route operations
    getDeliveryRouteById: (id: string) => deliveryRoutes.find(dr => dr.id === id)
  };
};
