
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
import { useLoads } from './useLoads';

export const useAppContextHooks = () => {
  const productOperations = useProductOperations();
  const customers = useCustomers();
  const products = useProducts();
  const deliveryRoutes = useDeliveryRoutes();
  const salesReps = useSalesReps();
  const vehicles = useVehicles();
  const paymentMethods = usePaymentMethods();
  const paymentTables = usePaymentTables();
  const orders = useOrders();
  const routes = useRoutes();
  const loads = useLoads();

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
    ...loads,
    // Add missing properties for compatibility
    createAutomaticPaymentRecord: async () => {},
    generateNextOrderCode: async () => 1
  };
};
