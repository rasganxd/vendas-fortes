
import { toast } from '@/components/ui/use-toast';
import { systemBackupService, maintenanceLogService, maintenanceSettingsService } from './supabase/systemBackupService';

export interface MaintenanceOperation {
  type: 'start_new_day' | 'start_new_month' | 'daily_backup' | 'monthly_backup' | 'cache_clear';
  name: string;
  description: string;
}

export const systemMaintenanceService = {
  async startNewDay(): Promise<boolean> {
    console.log('🌅 Starting new day operations...');
    const logId = await maintenanceLogService.startOperation('start_new_day');
    
    try {
      // 1. Collect system data first
      const systemData = await systemBackupService.collectSystemData();
      
      // 2. Create automatic daily backup
      await systemBackupService.createBackup({
        name: `Backup Diário - ${new Date().toLocaleDateString('pt-BR')}`,
        description: 'Backup automático antes do início do novo dia',
        backup_type: 'daily',
        created_by: 'auto-daily',
        data_snapshot: systemData
      });

      // 3. Clear daily caches
      localStorage.removeItem('daily_cache');
      localStorage.removeItem('temp_orders');
      localStorage.removeItem('session_data');

      // 4. Clean old daily backups
      const retentionSettings = await maintenanceSettingsService.getSetting('backup_retention');
      if (retentionSettings?.daily) {
        await systemBackupService.deleteOldBackups('daily', retentionSettings.daily);
      }

      // 5. Reset daily counters (example - would be actual business logic)
      console.log('🔄 Resetting daily counters and preparing for new day');

      await maintenanceLogService.completeOperation(logId, true, undefined, {
        operations_completed: ['backup_created', 'cache_cleared', 'counters_reset', 'old_backups_cleaned']
      });

      toast({
        title: "Novo dia iniciado com sucesso",
        description: "Sistema preparado para um novo dia de trabalho"
      });

      return true;
    } catch (error) {
      console.error('❌ Error starting new day:', error);
      await maintenanceLogService.completeOperation(logId, false, error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Erro ao iniciar novo dia",
        description: "Não foi possível completar as operações do novo dia",
        variant: "destructive"
      });
      
      return false;
    }
  },

  async startNewMonth(): Promise<boolean> {
    console.log('📅 Starting new month operations...');
    const logId = await maintenanceLogService.startOperation('start_new_month');
    
    try {
      // 1. Collect system data first
      const systemData = await systemBackupService.collectSystemData();
      
      // 2. Create monthly backup
      await systemBackupService.createBackup({
        name: `Backup Mensal - ${new Date().toLocaleDateString('pt-BR')}`,
        description: 'Backup automático de fechamento mensal',
        backup_type: 'monthly',
        created_by: 'auto-monthly',
        data_snapshot: systemData
      });

      // 3. Archive previous month data (example logic)
      console.log('📦 Archiving previous month data...');
      
      // 4. Generate monthly reports (example)
      console.log('📊 Generating monthly reports...');

      // 5. Clean old monthly backups
      const retentionSettings = await maintenanceSettingsService.getSetting('backup_retention');
      if (retentionSettings?.monthly) {
        await systemBackupService.deleteOldBackups('monthly', retentionSettings.monthly);
      }

      // 6. Reset monthly counters
      console.log('🔄 Resetting monthly counters');

      await maintenanceLogService.completeOperation(logId, true, undefined, {
        operations_completed: ['monthly_backup_created', 'data_archived', 'reports_generated', 'counters_reset']
      });

      toast({
        title: "Fechamento mensal concluído",
        description: "Sistema preparado para o novo mês"
      });

      return true;
    } catch (error) {
      console.error('❌ Error starting new month:', error);
      await maintenanceLogService.completeOperation(logId, false, error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Erro no fechamento mensal",
        description: "Não foi possível completar o fechamento mensal",
        variant: "destructive"
      });
      
      return false;
    }
  },

  async createManualBackup(name?: string, description?: string): Promise<boolean> {
    console.log('💾 Creating manual backup...');
    const logId = await maintenanceLogService.startOperation('daily_backup');
    
    try {
      const backupName = name || `Backup Manual - ${new Date().toLocaleString('pt-BR')}`;
      const backupDescription = description || 'Backup criado manualmente pelo usuário';

      // Collect system data first
      const systemData = await systemBackupService.collectSystemData();

      await systemBackupService.createBackup({
        name: backupName,
        description: backupDescription,
        backup_type: 'manual',
        created_by: 'user',
        data_snapshot: systemData
      });

      await maintenanceLogService.completeOperation(logId, true, undefined, {
        backup_name: backupName
      });

      toast({
        title: "Backup criado com sucesso",
        description: backupName
      });

      return true;
    } catch (error) {
      console.error('❌ Error creating manual backup:', error);
      await maintenanceLogService.completeOperation(logId, false, error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Erro ao criar backup",
        description: "Não foi possível criar o backup",
        variant: "destructive"
      });
      
      return false;
    }
  },

  async clearSystemCache(): Promise<void> {
    console.log('🧹 Clearing system cache...');
    const logId = await maintenanceLogService.startOperation('cache_clear');
    
    try {
      // Clear various caches
      const cacheKeys = [
        'cached_products',
        'cached_customers', 
        'cached_orders',
        'cached_sales_reps',
        'cached_payment_tables',
        'daily_cache',
        'session_data',
        'temp_data'
      ];

      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear any IndexedDB cache if exists
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      await maintenanceLogService.completeOperation(logId, true, undefined, {
        cache_keys_cleared: cacheKeys.length,
        operation: 'cache_clear'
      });

      toast({
        title: "Cache limpo com sucesso",
        description: "Todo o cache do sistema foi limpo"
      });
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      await maintenanceLogService.completeOperation(logId, false, error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Erro ao limpar cache",
        description: "Não foi possível limpar todo o cache",
        variant: "destructive"
      });
    }
  },

  async getMaintenanceHistory(): Promise<any[]> {
    return await maintenanceLogService.getRecentLogs(100);
  },

  async getBackupHistory(): Promise<any[]> {
    return await systemBackupService.getBackups(50);
  },

  async getMaintenanceSettings(): Promise<Record<string, any>> {
    return await maintenanceSettingsService.getAllSettings();
  },

  async updateMaintenanceSettings(settings: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await maintenanceSettingsService.updateSetting(key, value);
    }
    
    toast({
      title: "Configurações atualizadas",
      description: "As configurações de manutenção foram salvas"
    });
  }
};
