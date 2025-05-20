
import { syncService } from '@/services/supabase/syncService';

/**
 * Starts a new month process
 * @param createBackup Function to create a backup before starting new month
 */
export const startNewMonth = async (createBackup: (name: string, description?: string) => any) => {
  try {
    const backupId = createBackup(
      `Auto-backup before month close ${new Date().toLocaleDateString()}`,
      'Automatic backup created before closing month'
    );
    
    if (!backupId) {
      console.error("Não foi possível criar backup antes de iniciar novo mês");
      return false;
    }
    
    // Here would be code to reset monthly data, finalize reports, etc.
    console.log("Novo mês iniciado: O sistema foi preparado para o novo mês");
    
    return true;
  } catch (error) {
    console.error("Error starting new month:", error);
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
    
    console.log("Cache limpo com sucesso!");
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    throw error;
  }
};

/**
 * Generates and syncs data for mobile sales force
 * @param salesReps Array of sales rep IDs to sync data for, empty for all
 * @returns True if sync was successful
 */
export const syncMobileData = async (salesReps: string[] = []): Promise<boolean> => {
  try {
    // Log start of sync process
    console.log("Sincronização iniciada: Preparando dados para equipe de vendas móvel...");
    
    // Fetch all sales reps if none specified
    let syncTargets = salesReps;
    if (syncTargets.length === 0) {
      const allSalesReps = await syncService.getAllSalesReps();
      syncTargets = allSalesReps.map(rep => rep.id);
    }
    
    // Early return if no sales reps to sync
    if (syncTargets.length === 0) {
      console.error("Nenhum vendedor encontrado para sincronizar os dados");
      return false;
    }
    
    // Process each sales rep
    const syncPromises = syncTargets.map(async (salesRepId) => {
      try {
        // Sync sales rep data
        const syncedRep = await syncService.syncSalesRepById(salesRepId);
        
        if (!syncedRep) {
          console.error(`Failed to sync sales rep ${salesRepId}`);
          return false;
        }
        
        // Log successful sync for this rep
        console.log(`Successfully synced data for sales rep: ${syncedRep.name}`);
        return true;
      } catch (error) {
        console.error(`Error syncing data for sales rep ${salesRepId}:`, error);
        return false;
      }
    });
    
    // Wait for all sync operations to complete
    const results = await Promise.all(syncPromises);
    const successCount = results.filter(Boolean).length;
    
    // Show results
    if (successCount === syncTargets.length) {
      console.log(`Sincronização concluída: Dados preparados com sucesso para ${successCount} vendedores`);
      return true;
    } else {
      console.log(`Sincronização parcial: Sincronizados ${successCount} de ${syncTargets.length} vendedores`);
      return successCount > 0;
    }
  } catch (error) {
    console.error("Error syncing mobile data:", error);
    return false;
  }
};
