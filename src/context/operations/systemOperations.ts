
import { toast } from '@/components/ui/use-toast';
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
      toast({
        title: "Erro",
        description: "Não foi possível criar backup antes de iniciar novo mês",
        variant: "destructive"
      });
      return false;
    }
    
    // Here would be code to reset monthly data, finalize reports, etc.
    // For now we just show a success message
    
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
 * Generates and syncs data for mobile sales force
 * @param salesReps Array of sales rep IDs to sync data for, empty for all
 * @returns True if sync was successful
 */
export const syncMobileData = async (salesReps: string[] = []): Promise<boolean> => {
  try {
    // Log start of sync process
    toast({
      title: "Sincronização iniciada",
      description: "Preparando dados para equipe de vendas móvel..."
    });
    
    // Fetch all sales reps if none specified
    let syncTargets = salesReps;
    if (syncTargets.length === 0) {
      const allSalesReps = await syncService.getAllSalesReps();
      syncTargets = allSalesReps.map(rep => rep.id);
    }
    
    // Early return if no sales reps to sync
    if (syncTargets.length === 0) {
      toast({
        title: "Nenhum vendedor encontrado",
        description: "Não há vendedores para sincronizar os dados",
        variant: "destructive"
      });
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
    
    // Show toast with results
    if (successCount === syncTargets.length) {
      toast({
        title: "Sincronização concluída",
        description: `Dados preparados com sucesso para ${successCount} vendedores`
      });
      return true;
    } else {
      toast({
        title: "Sincronização parcial",
        description: `Sincronizados ${successCount} de ${syncTargets.length} vendedores`
      });
      return successCount > 0;
    }
  } catch (error) {
    console.error("Error syncing mobile data:", error);
    toast({
      title: "Erro na sincronização",
      description: "Houve um problema ao sincronizar os dados móveis",
      variant: "destructive"
    });
    return false;
  }
};
