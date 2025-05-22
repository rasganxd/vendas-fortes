import React, { useEffect } from 'react';
import { AppContextType } from '../AppContextTypes';
import { useAppData } from './AppDataProvider';
import { useAppOperations } from '../operations/appOperations';
import { AppContext } from '../AppContext';
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

export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  // Obter dados da aplicação
  const appData = useAppData();
  
  // Obter operações da aplicação
  const { productOperations, customerOperations, systemOperations } = useAppOperations();
  
  // Hooks específicos para operações
  const { 
    getOrderById,
    addOrder,
    updateOrder: updateOrderHook,
    deleteOrder
  } = useOrders();
  
  const {
    addRoute,
    updateRoute,
    deleteRoute
  } = useRoutes();
  
  const {
    addVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehicles();
  
  const {
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord
  } = usePayments();
  
  const {
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  } = usePaymentMethods();
  
  const {
    addLoad,
    updateLoad,
    deleteLoad
  } = useLoads();
  
  const {
    addSalesRep,
    updateSalesRep,
    deleteSalesRep
  } = useSalesReps();
  
  const {
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = usePaymentTables();
  
  const {
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();
  
  const {
    addProductCategory,
    updateProductCategory,
    deleteProductCategory: deleteProductCategoryHook
  } = useProductCategories();
  
  const {
    addProductBrand,
    updateProductBrand,
    deleteProductBrand: deleteProductBrandHook
  } = useProductBrands();
  
  const {
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();

  // Get app settings
  const { 
    settings,
    isLoading: isLoadingSettings
  } = useAppSettings();
  
  // Apply theme color if set in settings, otherwise use default neutral color
  useEffect(() => {
    const defaultColor = '#6B7280'; // Cinza neutro como padrão
    
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --primary: ${defaultColor} !important;
        --ring: ${defaultColor} !important;
        --sidebar-primary: ${defaultColor} !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
  
  // Wrappers para corrigir tipos de retorno
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
  
  // Construir valor do contexto
  const contextValue: AppContextType = {
    // Dados da aplicação
    ...appData,
    
    // Setters adicionais que não estão no AppData
    setProductGroups: () => {},
    setProductCategories: () => {},
    setProductBrands: () => {},
    setDeliveryRoutes: () => {},
    
    // Operações de cliente
    ...customerOperations,
    
    // Operações de produto
    ...productOperations,
    
    // Operações de sistema
    ...systemOperations,
    clearCache: async () => {
      await appData.refreshData();
    },
    
    // Operações específicas
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    
    addRoute,
    updateRoute,
    deleteRoute,
    
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord: createAutoPaymentWrapper,
    
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    
    addLoad,
    updateLoad,
    deleteLoad,
    
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    
    addProductGroup,
    updateProductGroup: async (id: string, data: Partial<ProductGroup>): Promise<void> => {
      await updateProductGroup(id, data);
    },
    deleteProductGroup: async (id: string): Promise<void> => {
      await deleteProductGroup(id);
    },
    
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
    
    // Make sure refreshData returns boolean to match AppContextType
    refreshData: async () => {
      const result = await appData.refreshData();
      return result; // Return the boolean result from appData.refreshData
    }
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
