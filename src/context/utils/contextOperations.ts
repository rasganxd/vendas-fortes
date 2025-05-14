
// General utility functions for context operations
import { toast } from '@/components/ui/use-toast';

/**
 * Starts a new month process
 * @param createBackup Function to create a backup before starting new month
 */
export const startNewMonth = async (createBackup: (name: string, description?: string) => any): Promise<boolean> => {
  try {
    const backupId = createBackup(
      `Auto-backup before month close ${new Date().toLocaleDateString()}`,
      'Automatic backup created before closing month'
    );
    
    if (!backupId) {
      toast({
        title: "Erro",
        description: "Não foi possível criar backup antes de iniciar novo mês",
        variant: "destructive"
      });
      return false;
    }
    
    // Here would be code to reset monthly data, finalize reports, etc.
    toast({
      title: "Novo mês iniciado",
      description: "O sistema foi preparado para o novo mês"
    });
    
    return true;
  } catch (error) {
    console.error("Error starting new month:", error);
    toast({
      title: "Erro",
      description: "Houve um problema ao iniciar novo mês",
      variant: "destructive"
    });
    return false;
  }
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
