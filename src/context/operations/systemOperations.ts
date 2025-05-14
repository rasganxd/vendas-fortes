
import { toast } from '@/components/ui/use-toast';

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
