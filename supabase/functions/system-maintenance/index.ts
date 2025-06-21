
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { operation } = await req.json()
    
    console.log(`🔧 System maintenance operation requested: ${operation}`)

    let result = { success: false, message: '', details: {} }

    switch (operation) {
      case 'daily_backup':
        result = await performDailyBackup(su pabaseClient)
        break
      case 'monthly_backup':
        result = await performMonthlyBackup(supabaseClient)
        break
      case 'cleanup_old_backups':
        result = await cleanupOldBackups(supabaseClient)
        break
      default:
        result = { success: false, message: 'Unknown operation', details: {} }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    )
  } catch (error) {
    console.error('❌ System maintenance error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message,
        details: {} 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function performDailyBackup(supabase: any) {
  console.log('📦 Performing daily backup...')
  
  // Log start of operation
  const { data: logData } = await supabase
    .from('maintenance_logs')
    .insert({
      operation_type: 'daily_backup',
      status: 'started',
      details: { triggered_by: 'cron' }
    })
    .select('id')
    .single()

  const logId = logData?.id

  try {
    // Collect system data
    const systemData = await collectSystemData(supabase)
    
    // Create backup record
    const { error: backupError } = await supabase
      .from('system_backups')
      .insert({
        name: `Backup Automático Diário - ${new Date().toLocaleDateString('pt-BR')}`,
        description: 'Backup diário automático executado via cron',
        backup_type: 'daily',
        data_snapshot: systemData,
        file_size: JSON.stringify(systemData).length,
        status: 'completed',
        created_by: 'auto-cron'
      })

    if (backupError) throw backupError

    // Complete log
    if (logId) {
      await supabase
        .from('maintenance_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          details: { 
            triggered_by: 'cron',
            data_tables_backed_up: Object.keys(systemData.tables || {}).length
          }
        })
        .eq('id', logId)
    }

    return { 
      success: true, 
      message: 'Daily backup completed successfully',
      details: { backup_created: true }
    }
  } catch (error) {
    // Log failure
    if (logId) {
      await supabase
        .from('maintenance_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', logId)
    }
    
    throw error
  }
}

async function performMonthlyBackup(supabase: any) {
  console.log('📅 Performing monthly backup...')
  
  const { data: logData } = await supabase
    .from('maintenance_logs')
    .insert({
      operation_type: 'monthly_backup',
      status: 'started',
      details: { triggered_by: 'cron' }
    })
    .select('id')
    .single()

  const logId = logData?.id

  try {
    const systemData = await collectSystemData(supabase)
    
    const { error: backupError } = await supabase
      .from('system_backups')
      .insert({
        name: `Backup Automático Mensal - ${new Date().toLocaleDateString('pt-BR')}`,
        description: 'Backup mensal automático executado via cron',
        backup_type: 'monthly',
        data_snapshot: systemData,
        file_size: JSON.stringify(systemData).length,
        status: 'completed',
        created_by: 'auto-cron'
      })

    if (backupError) throw backupError

    if (logId) {
      await supabase
        .from('maintenance_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          details: { 
            triggered_by: 'cron',
            data_tables_backed_up: Object.keys(systemData.tables || {}).length
          }
        })
        .eq('id', logId)
    }

    return { 
      success: true, 
      message: 'Monthly backup completed successfully',
      details: { backup_created: true }
    }
  } catch (error) {
    if (logId) {
      await supabase
        .from('maintenance_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', logId)
    }
    
    throw error
  }
}

async function cleanupOldBackups(supabase: any) {
  console.log('🗑️ Cleaning up old backups...')
  
  // Get retention settings
  const { data: settings } = await supabase
    .from('maintenance_settings')
    .select('setting_value')
    .eq('setting_key', 'backup_retention')
    .single()

  const retentionSettings = settings?.setting_value || { daily: 7, monthly: 12 }

  // Clean daily backups
  const { data: dailyBackupsToDelete } = await supabase
    .from('system_backups')
    .select('id')
    .eq('backup_type', 'daily')
    .order('created_at', { ascending: false })
    .range(retentionSettings.daily, 1000)

  if (dailyBackupsToDelete && dailyBackupsToDelete.length > 0) {
    await supabase
      .from('system_backups')
      .delete()
      .in('id', dailyBackupsToDelete.map(b => b.id))
  }

  // Clean monthly backups
  const { data: monthlyBackupsToDelete } = await supabase
    .from('system_backups')
    .select('id')
    .eq('backup_type', 'monthly')
    .order('created_at', { ascending: false })
    .range(retentionSettings.monthly, 1000)

  if (monthlyBackupsToDelete && monthlyBackupsToDelete.length > 0) {
    await supabase
      .from('system_backups')
      .delete()
      .in('id', monthlyBackupsToDelete.map(b => b.id))
  }

  return {
    success: true,
    message: 'Backup cleanup completed',
    details: {
      daily_deleted: dailyBackupsToDelete?.length || 0,
      monthly_deleted: monthlyBackupsToDelete?.length || 0
    }
  }
}

async function collectSystemData(supabase: any) {
  const systemData = {
    timestamp: new Date().toISOString(),
    tables: {} as any
  }

  const tables = ['customers', 'products', 'orders', 'sales_reps', 'payment_tables']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*')
      if (!error && data) {
        systemData.tables[table] = {
          count: data.length,
          sample: data.slice(0, 3) // Small sample for verification
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not backup table ${table}:`, error)
    }
  }

  return systemData
}
