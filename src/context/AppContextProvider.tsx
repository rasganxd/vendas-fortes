import React, { createContext, useState, useEffect } from 'react';
import { AppContextType } from './AppContextTypes';
import { defaultContextValues } from './defaultContextValues';
import { useCustomers, loadCustomers } from '@/hooks/useCustomers';
import { loadOrders, useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { loadProducts } from '@/hooks/useProducts';
import { Customer, Product, Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  validateProductDiscount,
  getMinimumPrice,
  addBulkProducts
} from './operations/productOperations';
import { loadCoreData, loadFromLocalStorage } from './operations/dataLoading';
import { startNewMonth, clearCache } from './utils/contextOperations';
import { supabase } from '@/integrations/supabase/client';

export const AppContext = createContext<AppContextType>(defaultContextValues);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // States for all data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>(navigator.onLine ? 'online' : 'offline');
  
  // Monitor Supabase connection status
  useEffect(() => {
    const handleConnectionChange = () => {
      const isOnline = navigator.onLine;
      setConnectionStatus(isOnline ? 'online' : 'offline');
      
      if (isOnline) {
        toast({
          title: "Conexão restaurada",
          description: "Sua conexão com o servidor foi restaurada.",
          variant: "default"
        });
        
        // Reload data when coming online
        loadCoreData(
          setIsLoadingCustomers,
          setCustomers,
          setIsUsingMockData,
          setIsLoadingProducts,
          setProducts
        );
      } else {
        toast({
          title: "Modo offline ativado",
          description: "Você está trabalhando no modo offline. Algumas funcionalidades podem estar limitadas.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    // Setup Supabase health check
    const healthCheck = setInterval(async () => {
      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('customers').select('count').limit(1).single();
          if (error) {
            console.error("Supabase connection check failed:", error);
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('online');
          }
        } catch (e) {
          console.error("Error checking Supabase connection:", e);
          setConnectionStatus('offline');
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      clearInterval(healthCheck);
    };
  }, []);
  
  // Get order hook data (moved before the useEffect to avoid redeclarations)
  const { 
    orders,
    setOrders,
    isLoading: isLoadingOrders,
    getOrderById,
    addOrder,
    updateOrder: updateOrderHook,  // Renamed to avoid conflict
    deleteOrder
  } = useOrders();
  
  // Try to load data from localStorage first if available
  useEffect(() => {
    console.log("AppProvider: Loading from localStorage");
    loadFromLocalStorage(setCustomers, setProducts);
  }, []);
  
  // Load core data on app initialization
  useEffect(() => {
    console.log("AppProvider: Loading core data");
    loadCoreData(
      setIsLoadingCustomers,
      setCustomers,
      setIsUsingMockData,
      setIsLoadingProducts,
      setProducts
    ).then(usingMock => {
      console.log("AppProvider: Core data loaded, using mock:", usingMock);
      // If using mock data, show a notification
      if (usingMock) {
        toast({
          title: "Modo offline ativado",
          description: "O sistema está usando dados locais devido a problemas de conexão com o Supabase.",
          variant: "default"  // Changed from "warning" to "default"
        });
      }
    });
  }, []);
  
  // Debug products changes
  useEffect(() => {
    console.log("AppProvider: Products updated, count:", products.length);
  }, [products]);
  
  // Get data from other hooks
  const { 
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    generateNextCustomerCode,
    isOnline: customersOnline
  } = useCustomers();
  
  const { 
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    isLoading: isLoadingPayments,
    setPayments,
    createAutomaticPaymentRecord
  } = usePayments();
  
  const {
    routes,
    addRoute,
    updateRoute,
    deleteRoute,
    isLoading: isLoadingRoutes,
    setRoutes
  } = useRoutes();
  
  const {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    isLoading: isLoadingLoads,
    setLoads
  } = useLoads();
  
  const {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    isLoading: isLoadingSalesReps,
    setSalesReps
  } = useSalesReps();
  
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    isLoading: isLoadingVehicles,
    setVehicles
  } = useVehicles();
  
  const {
    paymentMethods,
    setPaymentMethods
  } = usePaymentMethods();
  
  const {
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    isLoading: isLoadingPaymentTables,
    setPaymentTables
  } = usePaymentTables();
  
  const {
    productGroups: fetchedProductGroups,
    isLoading: isLoadingProductGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();
  
  const {
    productCategories: fetchedProductCategories,
    isLoading: isLoadingProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();
  
  const {
    productBrands: fetchedProductBrands,
    isLoading: isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();
  
  const {
    deliveryRoutes: fetchedDeliveryRoutes,
    isLoading: isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();
  
  const {
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  const { 
    settings,
    updateSettings,
    isLoading: isLoadingSettings
  } = useAppSettings();

  // Build context value with connection status
  const contextValue: AppContextType = {
    customers,
    products,
    orders,
    payments,
    routes,
    loads,
    salesReps,
    vehicles,
    paymentMethods,
    paymentTables,
    productGroups: fetchedProductGroups,
    productCategories: fetchedProductCategories,
    productBrands: fetchedProductBrands,
    deliveryRoutes: fetchedDeliveryRoutes,
    backups,
    
    isLoadingCustomers,
    isLoadingProducts,
    isLoadingOrders,
    isLoadingPayments,
    isLoadingRoutes,
    isLoadingLoads,
    isLoadingSalesReps,
    isLoadingVehicles,
    isLoadingPaymentMethods: false,
    isLoadingPaymentTables,
    isLoadingProductGroups,
    isLoadingProductCategories,
    isLoadingProductBrands,
    isLoadingDeliveryRoutes,
    isLoadingBackups,
    isUsingMockData,
    
    setCustomers,
    setProducts,
    setOrders,
    setPayments,
    setRoutes,
    setLoads,
    setSalesReps,
    setVehicles,
    setPaymentMethods,
    setPaymentTables,
    setProductGroups: () => {},
    setProductCategories: () => {},
    setProductBrands: () => {},
    setDeliveryRoutes: () => {},
    setBackups,
    
    addRoute,
    updateRoute,
    deleteRoute,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    
    // Product operations with bound parameters
    addProduct: async (product) => {
      console.log("Context: Adding product", product);
      const id = await addProduct(product, products, setProducts);
      console.log("Context: Product added with ID:", id);
      return id;
    },
    updateProduct: (id, product) => {
      console.log("Context: Updating product", id, product);
      return updateProduct(id, product, products, setProducts);
    },
    deleteProduct: (id) => {
      console.log("Context: Deleting product", id);
      return deleteProduct(id, products, setProducts);
    },
    validateProductDiscount: (productId, discountedPrice) => validateProductDiscount(productId, discountedPrice, products),
    getMinimumPrice: (productId) => getMinimumPrice(productId, products),
    addBulkProducts: (productsArray) => {
      console.log("Context: Adding bulk products", productsArray.length);
      return addBulkProducts(productsArray, products, setProducts, setIsUsingMockData);
    },
    
    getOrderById,
    addOrder,
    updateOrder: updateOrderHook,
    deleteOrder,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord,
    
    addPaymentMethod: async (method) => {
      const { addPaymentMethod } = usePaymentMethods();
      return addPaymentMethod(method);
    },
    updatePaymentMethod: async (id, method) => {
      const { updatePaymentMethod } = usePaymentMethods();
      await updatePaymentMethod(id, method);
    },
    deletePaymentMethod: async (id) => {
      const { deletePaymentMethod } = usePaymentMethods();
      await deletePaymentMethod(id);
    },
    
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
    updateProductGroup,
    deleteProductGroup,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
    
    createBackup,
    restoreBackup: (id) => {
      restoreBackup(id);
      return true;
    },
    deleteBackup: (id) => {
      deleteBackup(id);
      return true;
    },
    
    settings,
    updateSettings,
    startNewMonth: () => startNewMonth(createBackup),
    clearCache: () => clearCache(loadCustomers, loadProducts, loadOrders, setCustomers, setProducts, setOrders),
    refreshData: async () => {
      toast({
        title: "Atualizando dados",
        description: "Sincronizando dados com o servidor..."
      });
      
      try {
        await clearCache(loadCustomers, loadProducts, loadOrders, setCustomers, setProducts, setOrders);
        toast({
          title: "Dados atualizados",
          description: "Sincronização concluída com sucesso!"
        });
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast({
          title: "Erro na sincronização",
          description: "Houve um problema ao sincronizar os dados.",
          variant: "destructive"
        });
      }
      
      return true;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      
      {/* Indicador de status de conexão */}
      {connectionStatus === 'offline' && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Modo Offline - Usando dados locais</span>
        </div>
      )}
    </AppContext.Provider>
  );
};
