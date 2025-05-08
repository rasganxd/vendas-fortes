
import React, { createContext, useState, useEffect } from 'react';
import { useCustomers, loadCustomers } from '@/hooks/useCustomers';
import { loadOrders } from '@/hooks/useOrders';
import { customerService, productService, orderService } from '@/firebase/firestoreService';
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
import { useOrders } from '@/hooks/useOrders';
import { loadProducts } from '@/hooks/useProducts';
import { AppContextType } from './AppContextTypes';
import { defaultContextValues } from './defaultContextValues';
import { startNewMonth as startNewMonthUtil } from './utils/systemOperations';
import { Customer, Product, Order, Payment, Load, SalesRep, 
  Vehicle, PaymentMethod, PaymentTable, ProductGroup, 
  ProductCategory, ProductBrand, DeliveryRoute } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { mockProducts } from '@/data/mock/products';
import { mockCustomers } from '@/data/mock/customers';

export const AppContext = createContext<AppContextType>(defaultContextValues);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Estados para todos os dados
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  
  // Get order hook data (moved before the useEffect to avoid redeclarations)
  const { 
    orders,
    setOrders,
    isLoading: isLoadingOrders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder
  } = useOrders();
  
  // Try to load data from localStorage first if available
  useEffect(() => {
    // Check if there's any data in localStorage from previous sessions
    const loadLocalStorage = () => {
      const localCustomers = localStorage.getItem('mockCustomers');
      const localProducts = localStorage.getItem('mockProducts');
      
      if (localCustomers) {
        try {
          const parsedCustomers = JSON.parse(localCustomers);
          if (Array.isArray(parsedCustomers) && parsedCustomers.length > 0) {
            setCustomers(parsedCustomers);
            console.log("Loaded customers from localStorage:", parsedCustomers.length);
          }
        } catch (error) {
          console.error("Error parsing customers from localStorage:", error);
        }
      }
      
      if (localProducts) {
        try {
          const parsedProducts = JSON.parse(localProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
            console.log("Loaded products from localStorage:", parsedProducts.length);
          }
        } catch (error) {
          console.error("Error parsing products from localStorage:", error);
        }
      }
    };
    
    loadLocalStorage();
  }, []);
  
  // Load core data on app initialization
  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        console.log("Fetching core application data...");
        
        // Start loading customers
        setIsLoadingCustomers(true);
        let loadedCustomers: Customer[] = [];
        try {
          loadedCustomers = await loadCustomers();
          console.log(`Loaded ${loadedCustomers.length} customers`);
          setCustomers(loadedCustomers);
          
          // Check if we're using mock data
          if (loadedCustomers.length > 0 && loadedCustomers[0].id.startsWith('local-')) {
            setIsUsingMockData(true);
          }
        } catch (error) {
          console.error("Failed to load customers:", error);
          setCustomers(mockCustomers);
          setIsUsingMockData(true);
          toast({
            title: "Erro ao carregar clientes",
            description: "Usando dados locais temporariamente.",
            variant: "destructive"
          });
        } finally {
          setIsLoadingCustomers(false);
        }
        
        // Start loading products
        setIsLoadingProducts(true);
        try {
          const loadedProducts = await loadProducts();
          console.log(`Loaded ${loadedProducts.length} products`);
          setProducts(loadedProducts);
          
          // Check if we're using mock data
          if (loadedProducts === mockProducts) {
            setIsUsingMockData(true);
          }
        } catch (error) {
          console.error("Failed to load products:", error);
          setProducts(mockProducts);
          setIsUsingMockData(true);
          toast({
            title: "Erro ao carregar produtos",
            description: "Usando dados locais temporariamente.",
            variant: "destructive"
          });
        } finally {
          setIsLoadingProducts(false);
        }
        
        // If using mock data, show a notification
        if (isUsingMockData) {
          toast({
            title: "Modo offline ativado",
            description: "O sistema está usando dados locais devido a problemas de conexão com o Firebase.",
            variant: "default"  // Changed from "warning" to "default"
          });
        }
      } catch (error) {
        console.error("Error loading core data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Houve um problema ao carregar os dados do sistema.",
          variant: "destructive"
        });
      }
    };

    fetchCoreData();
  }, []);
  
  // Obter dados do hook de clientes
  const { 
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode: generateNextCustomerCode
  } = useCustomers();
  
  // Obter dados de outras hooks
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

  // Funções de produto implementadas diretamente
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Garantir que o produto tenha um código
      const productCode = product.code || (products.length > 0 
        ? Math.max(...products.map(p => p.code || 0)) + 1 
        : 1);
      const productWithCode = { ...product, code: productCode };
      
      console.log("Adding product to Firebase:", productWithCode);
      
      // Adicionar ao Firebase
      const id = await productService.add(productWithCode);
      const newProduct = { ...productWithCode, id };
      
      console.log("Product added with ID:", id);
      
      // Atualizar o estado local
      setProducts([...products, newProduct]);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Houve um problema ao adicionar o produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      // Nunca permitir que o código seja indefinido ou nulo ao atualizar
      const updateData = { ...product };
      if (updateData.code === undefined || updateData.code === null) {
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct && existingProduct.code) {
          updateData.code = existingProduct.code;
        }
      }
      
      // Atualizar no Firebase
      await productService.update(id, updateData);
      
      // Atualizar o estado local
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...updateData } : p
      ));
      
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Houve um problema ao atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Excluir do Firebase
      await productService.delete(id);
      // Atualizar o estado local
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };

  const validateProductDiscount = (productId: string, discountedPrice: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return true;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) return true;
    if (product.price <= 0) return false;
    
    const discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
    return parseFloat(discountPercentage.toFixed(2)) <= parseFloat(product.maxDiscountPercentage.toFixed(2));
  };

  const getMinimumPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) {
      return 0;
    }
    
    const minimumPrice = product.price * (1 - (product.maxDiscountPercentage / 100));
    return parseFloat(minimumPrice.toFixed(2));
  };

  const startNewMonth = () => {
    startNewMonthUtil(createBackup);
  };

  // Add clearCache implementation
  const clearCache = async (): Promise<void> => {
    try {
      console.log("Clearing application cache...");
      // Clear local storage
      localStorage.clear();
      // Reset any internal cache states you might have
      
      // Refresh data from server/database
      const loadedCustomers = await loadCustomers();
      setCustomers(loadedCustomers);
      
      const loadedProducts = await loadProducts();
      setProducts(loadedProducts);
      
      const loadedOrders = await loadOrders();
      setOrders(loadedOrders);
      
      toast({
        title: "Cache limpo",
        description: "Cache do aplicativo limpo com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      toast({
        title: "Erro",
        description: "Houve um erro ao limpar o cache do aplicativo.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Construir objeto de valor de contexto
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
    productGroups: productGroups.length > 0 ? productGroups : fetchedProductGroups,
    productCategories: productCategories.length > 0 ? productCategories : fetchedProductCategories,
    productBrands: productBrands.length > 0 ? productBrands : fetchedProductBrands,
    deliveryRoutes: deliveryRoutes.length > 0 ? deliveryRoutes : fetchedDeliveryRoutes,
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
    setProductGroups,
    setProductCategories,
    setProductBrands,
    setDeliveryRoutes,
    setBackups,
    
    addRoute,
    updateRoute,
    deleteRoute,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    getOrderById,
    addOrder,
    updateOrder,
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
    updatePaymentTable: async (id: string, paymentTable: Partial<PaymentTable>): Promise<void> => {
      await updatePaymentTable(id, paymentTable);
    },
    deletePaymentTable: async (id: string): Promise<void> => {
      await deletePaymentTable(id);
    },
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
    updateDeliveryRoute: async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
      await updateDeliveryRoute(id, route);
    },
    deleteDeliveryRoute: async (id: string): Promise<void> => {
      await deleteDeliveryRoute(id);
    },
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
    startNewMonth,
    clearCache
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
