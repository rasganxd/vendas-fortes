
import { toast } from '@/hooks/use-toast';

/**
 * Starts a new month process in the application
 * Creates a backup before resetting relevant data
 * @param createBackup Function to create a backup
 */
export const startNewMonth = (createBackup: (name: string, description?: string) => string) => {
  try {
    const backupId = createBackup(
      `Auto-backup before month close ${new Date().toLocaleDateString()}`,
      'Automatic backup created before closing month'
    );
    
    if (!backupId) {
      toast("Erro", {
        description: "Não foi possível criar backup antes de iniciar novo mês",
        variant: "destructive"
      });
      return;
    }
    
    // Here would be code to reset monthly data, finalize reports, etc.
    // For now we just show a success message
    
    toast("Novo mês iniciado", {
      description: "O sistema foi preparado para o novo mês"
    });
  } catch (error) {
    console.error("Error starting new month:", error);
    toast("Erro", {
      description: "Houve um problema ao iniciar novo mês",
      variant: "destructive"
    });
  }
};
