
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { cleanupUtils } from '@/utils/cleanupUtils';

// Tipos
interface DataLoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  clearItemCache: (itemType: string) => Promise<void>;
  isLoadingProducts: boolean;
  isLoadingCustomers: boolean;
  // Add missing properties that AppDataProvider needs
  customers: any[];
  products: any[];
  isUsingMockData: boolean;
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => Promise<boolean>;
}

const defaultValue: DataLoadingContextType = {
  isLoading: true,
  loadingMessage: 'Carregando dados...',
  clearItemCache: async () => {},
  isLoadingProducts: true,
  isLoadingCustomers: true,
  customers: [],
  products: [],
  isUsingMockData: false,
  setCustomers: () => {},
  setProducts: () => {},
  refreshData: async () => false
};

// Criar contexto
const DataLoadingContext = createContext<DataLoadingContextType>(defaultValue);

// Hook de acesso ao contexto
export const useDataLoading = () => useContext(DataLoadingContext);

// Provedor de dados
export const DataLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const { connectionStatus } = useFirebaseConnection();
  const isConnected = connectionStatus === 'online';
  
  const { 
    products, 
    isLoading: isLoadingProducts, 
    clearCache: clearProductsCache, 
    setProducts 
  } = useProducts();
  
  const { 
    customers, 
    isLoading: isLoadingCustomers, 
    clearCache: clearCustomersCache,
    setCustomers 
  } = useCustomers();
  
  const [isCleaningData, setIsCleaningData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Carregando dados...');
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Refresh all data
  const refreshData = async (): Promise<boolean> => {
    try {
      await clearItemCache('products');
      await clearItemCache('customers');
      return true;
    } catch (error) {
      console.error("Error refreshing data:", error);
      return false;
    }
  };

  // Limpar cache por tipo
  const clearItemCache = async (itemType: string) => {
    switch (itemType) {
      case 'products':
        await clearProductsCache();
        break;
      case 'customers':
        await clearCustomersCache();
        break;
      default:
        console.log(`No cache clearing mechanism for ${itemType}`);
    }
  };

  // Limpar duplicatas e problemas de dados
  useEffect(() => {
    const cleanupData = async () => {
      if (isConnected && !isCleaningData) {
        try {
          setIsCleaningData(true);
          setLoadingMessage("Limpando dados duplicados...");
          
          // Clean up duplicate product classifications
          await cleanupUtils.cleanupAllProductClassifications();
        } catch (error) {
          console.error("Error cleaning up data:", error);
        } finally {
          setIsCleaningData(false);
        }
      }
    };
    
    cleanupData();
  }, [isConnected, isCleaningData]);

  // Verificar se está carregando dados
  useEffect(() => {
    const loading = isLoadingProducts || isLoadingCustomers || !isConnected || isCleaningData;
    setIsLoading(loading);
    
    if (!loading) {
      setLoadingMessage('');
    } else if (isCleaningData) {
      setLoadingMessage('Limpando dados duplicados...');
    } else if (!isConnected) {
      setLoadingMessage('Conectando ao Firebase...');
    } else if (isLoadingProducts) {
      setLoadingMessage('Carregando produtos...');
    } else if (isLoadingCustomers) {
      setLoadingMessage('Carregando clientes...');
    }
  }, [isLoadingProducts, isLoadingCustomers, isConnected, isCleaningData]);

  return (
    <DataLoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        clearItemCache,
        isLoadingProducts,
        isLoadingCustomers,
        customers,
        products,
        isUsingMockData,
        setCustomers,
        setProducts,
        refreshData
      }}
    >
      {children}
    </DataLoadingContext.Provider>
  );
};
