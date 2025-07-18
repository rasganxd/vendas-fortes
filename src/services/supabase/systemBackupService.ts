
import { supabase } from '@/integrations/supabase/client';

export interface SystemBackup {
  id: string;
  name: string;
  description?: string;
  backup_type: 'daily' | 'monthly' | 'manual';
  created_at: string;
  file_size: number;
  status: 'completed' | 'in_progress' | 'failed';
  data_snapshot: any;
  created_by?: string;
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  operation_type: 'start_new_day' | 'start_new_month' | 'daily_backup' | 'monthly_backup' | 'cache_clear' | 'backup_restore';
  status: 'started' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  details?: any;
  error_message?: string;
  duration_seconds?: number;
  created_by?: string;
}

export interface MaintenanceSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export const systemBackupService = {
  async createBackup(backup: Omit<SystemBackup, 'id' | 'created_at' | 'status' | 'file_size'>): Promise<string> {
    console.log('📦 Creating system backup:', backup.name);
    
    // Collect system data for backup if not provided
    const systemData = backup.data_snapshot || await this.collectSystemData();
    const dataSize = JSON.stringify(systemData).length;
    
    const { data, error } = await supabase
      .from('system_backups')
      .insert({
        name: backup.name,
        description: backup.description,
        backup_type: backup.backup_type,
        data_snapshot: systemData,
        file_size: dataSize,
        status: 'completed',
        created_by: backup.created_by || 'system',
        notes: backup.notes
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating backup:', error);
      throw error;
    }

    console.log('✅ Backup created successfully:', data.id);
    return data.id;
  },

  async collectSystemData(): Promise<any> {
    console.log('📊 Collecting system data for backup...');
    
    const systemData = {
      timestamp: new Date().toISOString(),
      tables: {} as any
    };

    // Collect data from main tables using specific table names
    const tableQueries = [
      { name: 'customers', query: supabase.from('customers').select('*') },
      { name: 'products', query: supabase.from('products').select('*') },
      { name: 'orders', query: supabase.from('orders').select('*') },
      { name: 'sales_reps', query: supabase.from('sales_reps').select('*') },
      { name: 'payment_tables', query: supabase.from('payment_tables').select('*') }
    ];
    
    for (const tableQuery of tableQueries) {
      try {
        const { data, error } = await tableQuery.query;
        if (!error && data) {
          systemData.tables[tableQuery.name] = {
            count: data.length,
            data: data, // Store full data for restoration
            sample: data.slice(0, 5) // Store sample data for verification
          };
        }
      } catch (error) {
        console.warn(`⚠️ Could not backup table ${tableQuery.name}:`, error);
      }
    }

    return systemData;
  },

  async getBackups(limit = 20): Promise<SystemBackup[]> {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      backup_type: item.backup_type as 'daily' | 'monthly' | 'manual',
      created_at: item.created_at,
      file_size: item.file_size,
      status: item.status as 'completed' | 'in_progress' | 'failed',
      data_snapshot: item.data_snapshot,
      created_by: item.created_by,
      notes: item.notes
    }));
  },

  async deleteOldBackups(backupType: 'daily' | 'monthly', keepCount: number): Promise<void> {
    console.log(`🗑️ Cleaning old ${backupType} backups, keeping ${keepCount} most recent`);
    
    const { data: backupsToDelete } = await supabase
      .from('system_backups')
      .select('id')
      .eq('backup_type', backupType)
      .order('created_at', { ascending: false })
      .range(keepCount, 1000);

    if (backupsToDelete && backupsToDelete.length > 0) {
      const idsToDelete = backupsToDelete.map(b => b.id);
      const { error } = await supabase
        .from('system_backups')
        .delete()
        .in('id', idsToDelete);
      
      if (!error) {
        console.log(`✅ Deleted ${backupsToDelete.length} old ${backupType} backups`);
      }
    }
  },

  async restoreBackup(backupId: string): Promise<boolean> {
    console.log('🔄 Starting backup restoration:', backupId);
    
    try {
      // Get backup data
      const { data: backup, error: fetchError } = await supabase
        .from('system_backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (fetchError || !backup) {
        console.error('❌ Backup not found:', fetchError);
        throw new Error('Backup não encontrado');
      }

      if (backup.status !== 'completed') {
        throw new Error('Backup não está completo');
      }

      // Create a pre-restore backup first
      const preRestoreBackupId = await this.createBackup({
        name: `Pre-restore backup - ${new Date().toISOString()}`,
        description: `Backup automático criado antes de restaurar: ${backup.name}`,
        backup_type: 'manual',
        data_snapshot: await this.collectSystemData(),
        created_by: 'system',
        notes: `Backup de segurança antes da restauração`
      });

      console.log('✅ Pre-restore backup created:', preRestoreBackupId);

      // Start restoration process
      const logId = await maintenanceLogService.startOperation('backup_restore' as any, {
        backup_id: backupId,
        backup_name: backup.name,
        pre_restore_backup_id: preRestoreBackupId
      });

      // Restore data from backup
      const dataSnapshot = backup.data_snapshot as any;
      
      if (dataSnapshot && typeof dataSnapshot === 'object' && dataSnapshot.tables) {
        // Clear existing data and restore from backup
        const tablesToRestore = ['customers', 'products', 'orders', 'sales_reps', 'payment_tables'] as const;
        
        for (const tableName of tablesToRestore) {
          if (dataSnapshot.tables[tableName] && dataSnapshot.tables[tableName].data) {
            console.log(`🔄 Restoring table: ${tableName}`);
            
            // Delete existing data
            await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            // Insert backup data
            const backupData = dataSnapshot.tables[tableName].data;
            if (backupData && backupData.length > 0) {
              const { error: insertError } = await supabase
                .from(tableName)
                .insert(backupData);
              
              if (insertError) {
                console.error(`❌ Error restoring ${tableName}:`, insertError);
                throw new Error(`Erro ao restaurar tabela ${tableName}: ${insertError.message}`);
              }
            }
          }
        }
      }

      await maintenanceLogService.completeOperation(logId, true, undefined, {
        tables_restored: Object.keys((dataSnapshot as any)?.tables || {}),
        restoration_completed: true
      });

      console.log('✅ Backup restoration completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Error during backup restoration:', error);
      throw error;
    }
  },

  async deleteBackup(backupId: string): Promise<void> {
    console.log('🗑️ Deleting backup:', backupId);
    
    const { error } = await supabase
      .from('system_backups')
      .delete()
      .eq('id', backupId);

    if (error) {
      console.error('❌ Error deleting backup:', error);
      throw error;
    }

    console.log('✅ Backup deleted successfully');
  },

  async getBackupInfo(backupId: string): Promise<SystemBackup | null> {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      backup_type: data.backup_type as 'daily' | 'monthly' | 'manual',
      created_at: data.created_at,
      file_size: data.file_size,
      status: data.status as 'completed' | 'in_progress' | 'failed',
      data_snapshot: data.data_snapshot,
      created_by: data.created_by,
      notes: data.notes
    };
  }
};

export const maintenanceLogService = {
  async startOperation(operationType: MaintenanceLog['operation_type'], details?: any): Promise<string> {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert({
        operation_type: operationType,
        status: 'started',
        details: details || {},
        created_by: 'system'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async completeOperation(logId: string, success: boolean, errorMessage?: string, details?: any): Promise<void> {
    const startTime = await this.getOperationStartTime(logId);
    const duration = startTime ? Math.floor((Date.now() - new Date(startTime).getTime()) / 1000) : 0;

    const { error } = await supabase
      .from('maintenance_logs')
      .update({
        status: success ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
        duration_seconds: duration,
        details: details
      })
      .eq('id', logId);

    if (error) throw error;
  },

  async getOperationStartTime(logId: string): Promise<string | null> {
    const { data } = await supabase
      .from('maintenance_logs')
      .select('started_at')
      .eq('id', logId)
      .single();
    
    return data?.started_at || null;
  },

  async getRecentLogs(limit = 50): Promise<MaintenanceLog[]> {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      operation_type: item.operation_type as MaintenanceLog['operation_type'],
      status: item.status as 'started' | 'completed' | 'failed',
      started_at: item.started_at,
      completed_at: item.completed_at,
      details: item.details,
      error_message: item.error_message,
      duration_seconds: item.duration_seconds,
      created_by: item.created_by
    }));
  }
};

export const maintenanceSettingsService = {
  async getSetting(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('maintenance_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) return null;
    return data?.setting_value;
  },

  async updateSetting(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('maintenance_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
        updated_by: 'user'
      });

    if (error) throw error;
  },

  async getAllSettings(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('maintenance_settings')
      .select('setting_key, setting_value');

    if (error) throw error;
    
    const settings: Record<string, any> = {};
    data?.forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });
    
    return settings;
  }
};
