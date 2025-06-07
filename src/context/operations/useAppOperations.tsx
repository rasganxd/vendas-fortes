
import { useProductBrands } from '@/hooks/useProductBrands';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { usePayments } from '@/hooks/usePayments';
import { useLoads } from '@/hooks/useLoads';

export const useAppOperations = () => {
  // Get product brands operations
  const {
    productBrands,
    isLoading: isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();

  // Get product categories operations
  const {
    productCategories,
    isLoading: isLoadingProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();

  // Get product groups operations
  const {
    productGroups,
    isLoading: isLoadingProductGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();

  // Get sales reps operations
  const {
    salesReps,
    isLoading: isLoadingSalesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep
  } = useSalesReps();

  // Get vehicles operations
  const {
    vehicles,
    isLoading: isLoadingVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehicles();

  // Get delivery routes operations
  const {
    deliveryRoutes,
    isLoading: isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();

  // Get payment methods operations
  const {
    paymentMethods,
    isLoading: isLoadingPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  } = usePaymentMethods();

  // Get payment tables operations
  const {
    paymentTables,
    isLoading: isLoadingPaymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = usePaymentTables();

  // Get payments operations
  const {
    payments,
    isLoading: isLoadingPayments,
    addPayment,
    updatePayment,
    deletePayment
  } = usePayments();

  // Get loads operations
  const {
    loads,
    isLoading: isLoadingLoads,
    addLoad,
    updateLoad,
    deleteLoad
  } = useLoads();

  return {
    // Product brands
    productBrands,
    isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    
    // Product categories
    productCategories,
    isLoadingProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    
    // Product groups
    productGroups,
    isLoadingProductGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    
    // Sales reps
    salesReps,
    isLoadingSalesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    
    // Vehicles
    vehicles,
    isLoadingVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Delivery routes
    deliveryRoutes,
    isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
    
    // Payment methods
    paymentMethods,
    isLoadingPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    
    // Payment tables
    paymentTables,
    isLoadingPaymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    
    // Payments
    payments,
    isLoadingPayments,
    addPayment,
    updatePayment,
    deletePayment,
    
    // Loads - now using real functions instead of empty stubs
    loads,
    isLoadingLoads,
    addLoad,
    updateLoad,
    deleteLoad
  };
};
