
import { useProductOperations } from './useProductOperations';
import { useOrderOperations } from './useOrderOperations';
import { useCustomers } from './useCustomers';
import { useProducts } from './useProducts';
import { useDeliveryRoutes } from './useDeliveryRoutes';
import { useSalesReps } from './useSalesReps';
import { useVehicles } from './useVehicles';
import { usePaymentMethods } from './usePaymentMethods';
import { usePaymentTables } from './usePaymentTables';
import { useOrders } from './useOrders';

export const useAppContextHooks = () => {
  const productOperations = useProductOperations();
  const orderOperations = useOrderOperations();
  const customers = useCustomers();
  const products = useProducts();
  const deliveryRoutes = useDeliveryRoutes();
  const salesReps = useSalesReps();
  const vehicles = useVehicles();
  const paymentMethods = usePaymentMethods();
  const paymentTables = usePaymentTables();
  const orders = useOrders();

  return {
    ...productOperations,
    ...orderOperations,
    ...customers,
    ...products,
    ...deliveryRoutes,
    ...salesReps,
    ...vehicles,
    ...paymentMethods,
    ...paymentTables,
    ...orders
  };
};
