
import { useProductOperations } from './useProductOperations';
import { useCustomers } from './useCustomers';
import { useProducts } from './useProducts';
import { useDeliveryRoutes } from './useDeliveryRoutes';
import { useSalesReps } from './useSalesReps';
import { useVehicles } from './useVehicles';
import { usePaymentMethods } from './usePaymentMethods';
import { usePaymentTables } from './usePaymentTables';
import { useOrders } from './useOrders';
import { useRoutes } from './useRoutes';

export const useAppContextHooks = () => {
  const productOperations = useProductOperations();
  const customers = useCustomers();
  const products = useProducts();
  const deliveryRoutes = useDeliveryRoutes();
  const salesReps = useSalesReps();
  const vehicles = useVehicles();
  const paymentMethods = usePaymentMethods();
  const paymentTables = usePaymentTables();
  
  // Create the required callback functions for useOrders
  const markOrderAsBeingEdited = (orderId: string) => {
    console.log('Order marked as being edited:', orderId);
  };
  
  const unmarkOrderAsBeingEdited = (orderId: string) => {
    console.log('Order unmarked as being edited:', orderId);
  };
  
  const refreshOrdersCallback = async () => {
    console.log('Orders refresh callback triggered');
  };
  
  // Pass the required callbacks to useOrders
  const orders = useOrders();
  const routes = useRoutes();

  return {
    ...productOperations,
    ...customers,
    ...products,
    ...deliveryRoutes,
    ...salesReps,
    ...vehicles,
    ...paymentMethods,
    ...paymentTables,
    ...orders,
    ...routes,
    // Add missing properties for compatibility
    createAutomaticPaymentRecord: async () => {},
    generateNextOrderCode: async () => 1
  };
};
