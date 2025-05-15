import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Customer, Product, Order } from '@/types';
import { loadCustomers } from '@/hooks/useCustomers';
import { fetchProducts } from '@/hooks/useProducts';
import { loadOrders } from '@/hooks/useOrders';
import { mockProducts } from '@/data/mock/products';
import { mockCustomers } from '@/data/mock/customers';
import { useConnection } from './ConnectionProvider';
import { customerLocalService } from '@/services/local/customerLocalService';
import { productLocalService } from '@/services/local/productLocalService';
import { orderLocalService } from '@/services/local/orderLocalService';

interface DataLoadingContextType {
  customers: Customer[];
  products: Product[];
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isUsingMockData: boolean;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshData: () => Promise<boolean>;
}

const DataLoadingContext = createContext<DataLoadingContextType>({
  customers: [],
  products: [],
  isLoadingCustomers: true,
  isLoadingProducts: true,
  isUsingMockData: false,
  setCustomers: () => {},
  setProducts: () => {},
  refreshData: async () => false
});

export const useDataLoading = () => useContext(DataLoadingContext);

export const DataLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { isOnline } = useConnection();

  // Try to load data from localStorage first if available
  useEffect(() => {
    console.log("DataLoadingProvider: Loading from localStorage");
    loadFromLocalStorage(setCustomers, setProducts);
  }, []);

  // Load core data on app initialization
  useEffect(() => {
    console.log("DataLoadingProvider: Loading core data");
    loadCoreData(
      setIsLoadingCustomers,
      setCustomers,
      setIsUsingMockData,
      setIsLoadingProducts,
      setProducts
    ).then(usingMock => {
      console.log("DataLoadingProvider: Core data loaded, using mock:", usingMock);
      // If using mock data, show a notification
      if (usingMock) {
        toast({
          title: "Modo offline ativado",
          description: "O sistema está usando dados locais.",
          variant: "default"
        });
      }
    });
  }, []);

  // Debug products changes
  useEffect(() => {
    console.log("DataLoadingProvider: Products updated, count:", products.length);
  }, [products]);

  // Function to refresh data from the server
  const refreshData = async (): Promise<boolean> => {
    toast({
      title: "Atualizando dados",
      description: "Atualizando dados do armazenamento local..."
    });
    
    try {
      setIsLoadingCustomers(true);
      setIsLoadingProducts(true);
      
      const refreshedCustomers = await customerLocalService.getAll();
      setCustomers(refreshedCustomers);
      
      const refreshedProducts = await productLocalService.getAll();
      setProducts(refreshedProducts);
      
      setIsLoadingCustomers(false);
      setIsLoadingProducts(false);
      
      toast({
        title: "Dados atualizados",
        description: "Dados atualizados com sucesso!"
      });
      return true;
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Erro na atualização",
        description: "Houve um problema ao atualizar os dados.",
        variant: "destructive"
      });
      setIsLoadingCustomers(false);
      setIsLoadingProducts(false);
      return false;
    }
  };

  return (
    <DataLoadingContext.Provider value={{
      customers,
      products,
      isLoadingCustomers,
      isLoadingProducts,
      isUsingMockData,
      setCustomers,
      setProducts,
      refreshData
    }}>
      {children}
    </DataLoadingContext.Provider>
  );
};

/**
 * Loads core application data (customers and products)
 */
export const loadCoreData = async (
  setIsLoadingCustomers: React.Dispatch<React.SetStateAction<boolean>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setIsUsingMockData: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoadingProducts: React.Dispatch<React.SetStateAction<boolean>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    console.log("Fetching core application data...");
    
    // Start loading customers
    setIsLoadingCustomers(true);
    let loadedCustomers: Customer[] = [];
    try {
      loadedCustomers = await customerLocalService.getAll();
      console.log(`Loaded ${loadedCustomers.length} customers`);
      setCustomers(loadedCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);
      await customerLocalService.initializeWithDefault(mockCustomers);
      loadedCustomers = await customerLocalService.getAll();
      setCustomers(loadedCustomers);
      toast({
        title: "Erro ao carregar clientes",
        description: "Usando dados iniciais.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCustomers(false);
    }
    
    // Start loading products
    setIsLoadingProducts(true);
    try {
      console.log("About to load products...");
      const loadedProducts = await productLocalService.getAll();
      console.log(`Loaded ${loadedProducts.length} products`);
      setProducts(loadedProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
      await productLocalService.initializeWithDefault(mockProducts);
      const loadedProducts = await productLocalService.getAll();
      setProducts(loadedProducts);
      toast({
        title: "Erro ao carregar produtos",
        description: "Usando dados iniciais.",
        variant: "destructive"
      });
    } finally {
      console.log("Finished loading products, setting isLoadingProducts to false");
      setIsLoadingProducts(false);
    }
    
    // Return flag indicating if using mock data (false since we're using local storage)
    return false;
  } catch (error) {
    console.error("Error loading core data:", error);
    toast({
      title: "Erro ao carregar dados",
      description: "Houve um problema ao carregar os dados do sistema.",
      variant: "destructive"
    });
    return setIsUsingMockData;
  }
};

/**
 * Loads data from localStorage if available
 */
export const loadFromLocalStorage = (
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
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
        setProducts(currentProducts => {
          // Only update from localStorage if we don't have products yet
          if (currentProducts.length === 0) {
            console.log("Loaded products from localStorage:", parsedProducts.length);
            return parsedProducts;
          }
          return currentProducts;
        });
      }
    } catch (error) {
      console.error("Error parsing products from localStorage:", error);
    }
  }
};

/**
 * Clears application cache and refreshes data from server
 */
export const clearCache = async (
  loadCustomers: () => Promise<any[]>,
  fetchProducts: () => Promise<any[]>,
  loadOrders: () => Promise<any[]>,
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>,
  setProducts: React.Dispatch<React.SetStateAction<any[]>>,
): Promise<void> => {
  try {
    console.log("Clearing application cache...");
    // Clear local storage
    localStorage.clear();
    
    // Refresh data from server/database
    const loadedCustomers = await loadCustomers();
    setCustomers(loadedCustomers);
    
    const loadedProducts = await fetchProducts();
    setProducts(loadedProducts);
    
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
