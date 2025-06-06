
import { useAppContext } from '@/hooks/useAppContext';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { usePayments } from '@/hooks/usePayments';

export const useAppOperations = () => {
  // Get product brands operations
  const {
    productBrands,
    isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();

  // Get product categories operations
  const {
    productCategories,
    isLoadingProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();

  // Get product groups operations
  const {
    productGroups,
    isLoadingProductGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();

  // Get sales reps operations
  const {
    salesReps,
    isLoadingSalesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep
  } = useSalesReps();

  // Get vehicles operations
  const {
    vehicles,
    isLoadingVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehicles();

  // Get delivery routes operations
  const {
    deliveryRoutes,
    isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();

  // Get payment methods operations
  const {
    paymentMethods,
    isLoadingPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  } = usePaymentMethods();

  // Get payment tables operations
  const {
    paymentTables,
    isLoadingPaymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = usePaymentTables();

  // Get payments operations
  const {
    payments,
    isLoadingPayments,
    addPayment,
    updatePayment,
    deletePayment
  } = usePayments();

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
    
    // Empty loads array for compatibility
    loads: [],
    isLoadingLoads: false,
    addLoad: async () => '',
    updateLoad: async () => {},
    deleteLoad: async () => {}
  };
};
