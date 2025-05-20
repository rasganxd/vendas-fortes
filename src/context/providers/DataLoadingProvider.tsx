import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Customer, Product, Order } from '@/types';
import { loadCustomers } from '@/hooks/useCustomers';
import { fetchProducts } from '@/hooks/useProducts';
import { loadOrders } from '@/hooks/useOrders';
import { useConnection } from './ConnectionProvider';
import { customerLocalService } from '@/services/local/customerLocalService';
import { productLocalService } from '@/services/local/productLocalService';
import { orderLocalService } from '@/services/local/orderLocalService';
import { clearDemoData } from '@/utils/clearDemoData';

interface DataLoadingContextType {
  customers: Customer[];
  products: Product[];
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isUsingMockData: boolean;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  refreshData: () => Promise<boolean>;
  clearItemCache: (itemType: 'customers' | 'products' | 'orders' | 'all') => Promise<void>;
}

const DataLoadingContext = createContext<DataLoadingContextType>({
  customers: [],
  products: [],
  isLoadingCustomers: true,
  isLoadingProducts: true,
  isUsingMockData: false,
  setCustomers: () => {},
  setProducts: () => {},
  refreshData: async () => false,
  clearItemCache: async () => {}
});

export const useDataLoading = () => useContext(DataLoadingContext);

export const DataLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(0);
  const { isOnline } = useConnection();

  // Clear any demo data on first load
  useEffect(() => {
    clearDemoData();
  }, []);

  // Load core data on app initialization with priority to Firebase
  useEffect(() => {
    console.log("DataLoadingProvider: Loading core data from Firebase first");
    loadCoreDataFromFirebase();
  }, []);

  // Debug products changes
  useEffect(() => {
    console.log("DataLoadingProvider: Products updated, count:", products.length);
  }, [products]);

  // Function to load data from Firebase first
  const loadCoreDataFromFirebase = async () => {
    try {
      console.log("Loading data from Firebase directly");
      
      // Start loading customers from Firebase
      setIsLoadingCustomers(true);
      try {
        // Try to get from Firebase first
        const loadedCustomers = await loadCustomers(true); // force refresh from Firebase
        console.log(`Loaded ${loadedCustomers.length} customers from Firebase`);
        setCustomers(loadedCustomers);
        
        // Update local cache with latest data
        await customerLocalService.setAll(loadedCustomers);
        
        // Update sync timestamp
        setLastSyncTimestamp(Date.now());
      } catch (error) {
        console.error("Failed to load customers from Firebase:", error);
        
        // Fall back to local storage only if Firebase failed
        const localCustomers = await customerLocalService.getAll();
        setCustomers(localCustomers);
        
        toast({
          title: "Erro ao carregar clientes",
          description: "Usando dados locais temporariamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCustomers(false);
      }
      
      // Start loading products from Firebase
      setIsLoadingProducts(true);
      try {
        // Try to get from Firebase first
        const loadedProducts = await fetchProducts(true); // force refresh from Firebase
        console.log(`Loaded ${loadedProducts.length} products from Firebase`);
        setProducts(loadedProducts);
        
        // Update local cache with latest data
        await productLocalService.setAll(loadedProducts);
      } catch (error) {
        console.error("Failed to load products from Firebase:", error);
        
        // Fall back to local storage only if Firebase failed
        const localProducts = await productLocalService.getAll();
        setProducts(localProducts);
        
        toast({
          title: "Erro ao carregar produtos",
          description: "Usando dados locais temporariamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProducts(false);
      }
    } catch (error) {
      console.error("Error loading core data from Firebase:", error);
      
      // If Firebase completely fails, show error but don't load mock data
      console.log("Firebase loading failed completely");
      
      toast({
        title: "Erro ao carregar dados",
        description: "Houve um problema ao carregar os dados do sistema.",
        variant: "destructive"
      });
    }
  };

  /**
   * Clear cache for specific item types
   */
  const clearItemCache = async (itemType: 'customers' | 'products' | 'orders' | 'all'): Promise<void> => {
    console.log(`Clearing cache for: ${itemType}`);
    
    try {
      if (itemType === 'customers' || itemType === 'all') {
        // Force refresh from Firebase
        const refreshedCustomers = await loadCustomers(true);
        setCustomers(refreshedCustomers);
        await customerLocalService.setAll(refreshedCustomers);
        console.log("Customer cache refreshed from Firebase");
      }
      
      if (itemType === 'products' || itemType === 'all') {
        // Force refresh from Firebase
        const refreshedProducts = await fetchProducts(true);
        setProducts(refreshedProducts);
        await productLocalService.setAll(refreshedProducts);
        console.log("Product cache refreshed from Firebase");
      }
      
      if (itemType === 'orders' || itemType === 'all') {
        // Force refresh from Firebase
        const refreshedOrders = await loadOrders(true);
        await orderLocalService.setAll(refreshedOrders);
        console.log("Order cache refreshed from Firebase");
      }
      
      setLastSyncTimestamp(Date.now());
      
      toast({
        title: "Cache atualizado",
        description: "Os dados foram sincronizados com sucesso.",
      });
    } catch (error) {
      console.error(`Error clearing cache for ${itemType}:`, error);
      toast({
        title: "Erro na sincronização",
        description: "Falha ao atualizar o cache. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Function to refresh data from the server
  const refreshData = async (): Promise<boolean> => {
    toast({
      title: "Sincronizando dados",
      description: "Buscando dados mais recentes..."
    });
    
    try {
      // Force refresh from Firebase instead of local
      return await clearItemCache('all').then(() => true);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Erro na atualização",
        description: "Houve um problema ao atualizar os dados.",
        variant: "destructive"
      });
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
      refreshData,
      clearItemCache
    }}>
      {children}
    </DataLoadingContext.Provider>
  );
};

/**
 * Loads core application data (customers and products)
 * Modified to not use mock data as fallback
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
      setCustomers([]);
      toast({
        title: "Erro ao carregar clientes",
        description: "Nenhum cliente disponível.",
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
      setProducts([]);
      toast({
        title: "Erro ao carregar produtos",
        description: "Nenhum produto disponível.",
        variant: "destructive"
      });
    } finally {
      console.log("Finished loading products, setting isLoadingProducts to false");
      setIsLoadingProducts(false);
    }
    
    // Return flag indicating not using mock data
    return false;
  } catch (error) {
    console.error("Error loading core data:", error);
    toast({
      title: "Erro ao carregar dados",
      description: "Houve um problema ao carregar os dados do sistema.",
      variant: "destructive"
    });
    return false; // Never use mock data
  }
};

/**
 * Loads data from localStorage if available
 * Modified to not use mock data
 */
export const loadFromLocalStorage = (
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  // Just clear any existing mock data and return empty arrays
  clearDemoData();
  
  // Set empty arrays for customers and products
  setCustomers([]);
  setProducts([]);
  
  console.log("Local storage cleared of mock data");
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
