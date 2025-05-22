
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
}

const defaultValue: DataLoadingContextType = {
  isLoading: true,
  loadingMessage: 'Carregando dados...',
  clearItemCache: async () => {},
  isLoadingProducts: true,
  isLoadingCustomers: true
};

// Criar contexto
const DataLoadingContext = createContext<DataLoadingContextType>(defaultValue);

// Hook de acesso ao contexto
export const useDataLoading = () => useContext(DataLoadingContext);

// Provedor de dados
export const DataLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useFirebaseConnection();
  const { isLoading: isLoadingProducts, clearCache: clearProductsCache } = useProducts();
  const { isLoading: isLoadingCustomers, clearCache: clearCustomersCache } = useCustomers();
  
  const [isCleaningData, setIsCleaningData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Carregando dados...');

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
        isLoadingCustomers
      }}
    >
      {children}
    </DataLoadingContext.Provider>
  );
};
