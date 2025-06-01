
import { useState, useCallback } from 'react';
import { mobileOrderImportService, MobileOrderImportResult } from '@/services/supabase/mobileOrderImportService';
import { orderService } from '@/services/supabase/orderService';
import { toast } from 'sonner';

export const useMobileOrderImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const checkPendingOrders = useCallback(async () => {
    try {
      const { data, error } = await import('@/integrations/supabase/client').then(mod => 
        mod.supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('source_project', 'mobile')
          .eq('imported', false)
      );

      if (error) throw error;
      
      const count = data?.length || 0;
      setPendingOrdersCount(count);
      return count;
    } catch (error) {
      console.error('Error checking pending orders:', error);
      return 0;
    }
  }, []);

  const importMobileOrders = useCallback(async (salesRepId?: string): Promise<MobileOrderImportResult> => {
    try {
      setIsImporting(true);
      console.log('🚀 Starting mobile order import process...', salesRepId ? `for sales rep: ${salesRepId}` : 'for all sales reps');

      // Get pending orders from Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('source_project', 'mobile')
        .eq('imported', false)
        .order('created_at', { ascending: false });

      // Filtrar por vendedor se especificado
      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }

      const { data: pendingOrders, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Error fetching pending orders:', fetchError);
        throw fetchError;
      }

      if (!pendingOrders || pendingOrders.length === 0) {
        const result: MobileOrderImportResult = {
          success: true,
          imported: 0,
          failed: 0,
          errors: [],
          message: salesRepId 
            ? 'Nenhum pedido pendente para este vendedor' 
            : 'Nenhum pedido pendente para importação'
        };
        
        toast.info(result.message);
        return result;
      }

      console.log(`📦 Found ${pendingOrders.length} pending orders to import`);

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each order
      for (const orderData of pendingOrders) {
        try {
          console.log(`📝 Processing order ${orderData.code}...`);

          // Validate order data
          if (!orderData.customer_id || !orderData.sales_rep_id) {
            throw new Error(`Dados incompletos no pedido ${orderData.code}`);
          }

          // Order is already in Supabase, just need to mark as imported
          const { error: updateError } = await supabase
            .from('orders')
            .update({ imported: true, updated_at: new Date().toISOString() })
            .eq('id', orderData.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`✅ Order ${orderData.code} imported successfully`);
          imported++;

        } catch (error) {
          console.error(`❌ Failed to import order ${orderData.code}:`, error);
          failed++;
          errors.push(`Pedido ${orderData.code}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      // Log the import process
      await supabase.from('sync_logs').insert({
        event_type: 'download',
        data_type: 'orders',
        records_count: imported,
        sales_rep_id: salesRepId || null,
        status: failed > 0 ? 'partial' : 'completed',
        error_message: failed > 0 ? `${failed} pedidos falharam` : null,
        metadata: {
          imported,
          failed,
          errors: errors.slice(0, 5), // Log only first 5 errors
          sales_rep_id: salesRepId,
          import_type: salesRepId ? 'single_rep' : 'all_reps'
        }
      });

      const result: MobileOrderImportResult = {
        success: failed === 0,
        imported,
        failed,
        errors,
        message: `Importação concluída: ${imported} importados, ${failed} falharam`
      };

      // Update pending count
      await checkPendingOrders();

      // Show appropriate toast
      if (result.success && imported > 0) {
        toast.success('Importação realizada com sucesso!', {
          description: `${imported} pedidos foram importados${salesRepId ? ' para o vendedor selecionado' : ''}`
        });
      } else if (failed > 0) {
        toast.warning('Importação parcial', {
          description: `${imported} importados, ${failed} falharam`
        });
      }

      // Dispatch event to refresh orders list
      window.dispatchEvent(new CustomEvent('ordersUpdated'));

      console.log('✅ Mobile order import process completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Critical error during import:', error);
      
      const errorResult: MobileOrderImportResult = {
        success: false,
        imported: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        message: 'Falha na importação'
      };

      toast.error('Erro na importação', {
        description: 'Não foi possível importar os pedidos'
      });

      return errorResult;
    } finally {
      setIsImporting(false);
    }
  }, [checkPendingOrders]);

  const importSalesRepOrders = useCallback(async (salesRepId: string, salesRepName: string): Promise<MobileOrderImportResult> => {
    console.log(`🎯 Importing orders for sales rep: ${salesRepName} (${salesRepId})`);
    return await importMobileOrders(salesRepId);
  }, [importMobileOrders]);

  return {
    importMobileOrders,
    importSalesRepOrders,
    isImporting,
    pendingOrdersCount,
    checkPendingOrders
  };
};
