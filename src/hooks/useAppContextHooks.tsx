
import { useOrders } from '@/hooks/useOrders';
import { useRoutes } from '@/hooks/useRoutes';
import { useVehicles } from '@/hooks/useVehicles';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Order, ProductGroup } from '@/types';

/**
 * Hook that consolidates all app functionality hooks
 */
export const useAppContextHooks = () => {
  // Orders
  const { 
    getOrderById,
    addOrder,
    updateOrder: updateOrderHook,
    deleteOrder
  } = useOrders();
  
  // Routes
  const {
    addRoute,
    updateRoute,
    deleteRoute
  } = useRoutes();
  
  // Vehicles
  const {
    addVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehicles();
  
  // Payments
  const {
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord
  } = usePayments();
  
  // Payment Methods
  const {
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  } = usePaymentMethods();
  
  // Loads
  const {
    addLoad,
    updateLoad,
    deleteLoad
  } = useLoads();
  
  // Sales Reps
  const {
    addSalesRep,
    updateSalesRep,
    deleteSalesRep
  } = useSalesReps();
  
  // Payment Tables
  const {
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = usePaymentTables();
  
  // Product Groups
  const {
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();
  
  // Product Categories
  const {
    addProductCategory,
    updateProductCategory,
    deleteProductCategory: deleteProductCategoryHook
  } = useProductCategories();
  
  // Product Brands
  const {
    addProductBrand,
    updateProductBrand,
    deleteProductBrand: deleteProductBrandHook
  } = useProductBrands();
  
  // Delivery Routes
  const {
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();

  // App Settings
  const { 
    settings,
    isLoading: isLoadingSettings
  } = useAppSettings();
  
  // Wrapper functions for proper type handling
  const createAutoPaymentWrapper = async (order: Order): Promise<string> => {
    await createAutomaticPaymentRecord(order);
    return '';
  };

  const deleteProductCategory = async (id: string): Promise<void> => {
    try {
      await deleteProductCategoryHook(id);
    } catch (error) {
      console.error("Error deleting product category:", error);
    }
  };

  const deleteProductBrand = async (id: string): Promise<void> => {
    try {
      await deleteProductBrandHook(id);
    } catch (error) {
      console.error("Error deleting product brand:", error);
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>): Promise<string> => {
    try {
      await updateOrderHook(id, orderData);
      return id;
    } catch (error) {
      console.error("Error in updateOrder wrapper:", error);
      return "";
    }
  };
  
  return {
    // Orders
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    
    // Routes
    addRoute,
    updateRoute,
    deleteRoute,
    
    // Vehicles
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Payments
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord: createAutoPaymentWrapper,
    
    // Payment Methods
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    
    // Loads
    addLoad,
    updateLoad,
    deleteLoad,
    
    // Sales Reps
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    
    // Payment Tables
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    
    // Product Groups
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    
    // Product Categories
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    
    // Product Brands
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    
    // Delivery Routes
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
    
    // Settings
    settings,
    isLoadingSettings
  };
};
