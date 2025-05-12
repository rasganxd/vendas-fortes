
// General utility functions for context operations

import { toast } from '@/components/ui/use-toast';
import { startNewMonth as startNewMonthUtil } from './systemOperations';

/**
 * Starts a new month process
 * @param createBackup Function to create a backup before starting new month
 */
export const startNewMonth = (createBackup: (name: string, description?: string) => string) => {
  startNewMonthUtil(createBackup);
};

/**
 * Clears application cache and refreshes data from server
 */
export const clearCache = async (
  loadCustomers: () => Promise<any[]>,
  loadProducts: () => Promise<any[]>,
  loadOrders: () => Promise<any[]>,
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>,
  setProducts: React.Dispatch<React.SetStateAction<any[]>>,
  setOrders: React.Dispatch<React.SetStateAction<any[]>>,
): Promise<void> => {
  try {
    console.log("Clearing application cache...");
    // Clear local storage
    localStorage.clear();
    
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
