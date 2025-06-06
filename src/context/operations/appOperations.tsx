
import { AppContextType } from '../AppContextTypes';

export const createAppOperations = (context: AppContextType) => {
  const { 
    products, 
    customers, 
    deliveryRoutes, 
    salesReps,
    vehicles,
    paymentMethods,
    paymentTables,
    orders
  } = context;

  return {
    // Customer operations
    getCustomerById: (id: string) => customers.find(c => c.id === id),
    findCustomerByCode: (code: number) => customers.find(c => c.code === code),
    
    // Product operations
    getProductById: (id: string) => products.find(p => p.id === id),
    findProductByCode: (code: string) => products.find(p => p.code?.toString() === code.toString()),
    
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
    
    // Delivery route operations
    getDeliveryRouteById: (id: string) => deliveryRoutes.find(dr => dr.id === id)
  };
};
