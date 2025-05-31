
import { useState, useCallback } from 'react';
import { mobileOrderImportService, MobileOrderImportResult } from '@/services/supabase/mobileOrderImportService';
import { mobileOrderService } from '@/services/supabase/mobileOrderService';
import { toast } from 'sonner';

export const useMobileOrderImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<{
    lastCheck: string;
    ordersFound: number;
    withSalesRep: number;
    orphaned: number;
    error?: string;
  }>({
    lastCheck: '',
    ordersFound: 0,
    withSalesRep: 0,
    orphaned: 0
  });

  const checkPendingOrders = useCallback(async (forceRefresh = false) => {
    try {
      console.log('🔍 [DEBUG] Checking pending orders...', { forceRefresh, timestamp: new Date().toISOString() });
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Buscar TODOS os pedidos pendentes na tabela orders_mobile (incluindo órfãos)
      const { data, error } = await supabase
        .from('orders_mobile')
        .select('id, sales_rep_id, sales_rep_name, customer_name', { count: 'exact' })
        .eq('imported', false);

      if (error) {
        console.error('❌ [DEBUG] Error checking pending orders:', error);
        setDebugInfo(prev => ({
          ...prev,
          lastCheck: new Date().toISOString(),
          error: error.message
        }));
        throw error;
      }
      
      const count = data?.length || 0;
      const withSalesRep = data?.filter(order => order.sales_rep_id)?.length || 0;
      const orphaned = data?.filter(order => !order.sales_rep_id)?.length || 0;
      
      console.log(`✅ [DEBUG] Found ${count} pending mobile orders total:`, {
        total: count,
        withSalesRep,
        orphaned,
        data: data?.map(o => ({
          id: o.id,
          salesRep: o.sales_rep_name || 'Órfão',
          customer: o.customer_name
        }))
      });
      
      // Atualizar estado com informações de debug
      setDebugInfo({
        lastCheck: new Date().toISOString(),
        ordersFound: count,
        withSalesRep,
        orphaned,
        error: undefined
      });
      
      setPendingOrdersCount(count);
      
      // Toast de debug se pedidos foram encontrados
      if (count > 0) {
        console.log(`🎯 [DEBUG] Setting pending count to: ${count}`);
        toast.info(`Debug: ${count} pedidos encontrados`, {
          description: `${withSalesRep} com vendedor, ${orphaned} órfãos`
        });
      } else {
        console.log('⚠️ [DEBUG] No pending orders found');
        toast.warning('Debug: Nenhum pedido encontrado');
      }
      
      return count;
    } catch (error) {
      console.error('❌ [DEBUG] Error in checkPendingOrders:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
      return 0;
    }
  }, []);

  const importMobileOrders = useCallback(async (salesRepId?: string): Promise<MobileOrderImportResult> => {
    try {
      setIsImporting(true);
      console.log('🚀 [DEBUG] Starting mobile order import process...', salesRepId ? `for sales rep: ${salesRepId}` : 'for all orders');

      // Usar a função do banco de dados para importar
      const result = await mobileOrderService.importOrders(salesRepId);

      // Converter para o formato esperado
      const importResult: MobileOrderImportResult = {
        success: result.failed_count === 0,
        imported: result.imported_count,
        failed: result.failed_count,
        errors: result.error_messages,
        message: `Importação concluída: ${result.imported_count} importados, ${result.failed_count} falharam`
      };

      console.log('✅ [DEBUG] Import completed:', importResult);

      // Update pending count with force refresh
      await checkPendingOrders(true);

      // Show appropriate toast
      if (importResult.success && importResult.imported > 0) {
        toast.success('Importação realizada com sucesso!', {
          description: `${importResult.imported} pedidos foram importados${salesRepId ? ' para o vendedor selecionado' : ''}`
        });
      } else if (importResult.failed > 0) {
        toast.warning('Importação parcial', {
          description: `${importResult.imported} importados, ${importResult.failed} falharam`
        });
      } else if (importResult.imported === 0) {
        toast.info('Nenhum pedido para importar', {
          description: salesRepId 
            ? 'Nenhum pedido pendente para este vendedor' 
            : 'Nenhum pedido pendente para importação'
        });
      }

      // Dispatch event to refresh orders list
      window.dispatchEvent(new CustomEvent('ordersUpdated'));

      return importResult;

    } catch (error) {
      console.error('❌ [DEBUG] Critical error during import:', error);
      
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
    console.log(`🎯 [DEBUG] Importing orders for sales rep: ${salesRepName} (${salesRepId})`);
    return await importMobileOrders(salesRepId);
  }, [importMobileOrders]);

  const importOrphanedOrders = useCallback(async (): Promise<MobileOrderImportResult> => {
    console.log('🔄 [DEBUG] Importing orphaned orders (no sales rep)');
    
    try {
      setIsImporting(true);
      
      // Importar apenas pedidos órfãos (sem vendedor)
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Buscar pedidos órfãos
      const { data: orphanedOrders, error } = await supabase
        .from('orders_mobile')
        .select('*')
        .eq('imported', false)
        .is('sales_rep_id', null);

      if (error) throw error;

      console.log(`🔍 [DEBUG] Found ${orphanedOrders?.length || 0} orphaned orders`);

      if (!orphanedOrders || orphanedOrders.length === 0) {
        toast.info('Nenhum pedido órfão para importar');
        return {
          success: true,
          imported: 0,
          failed: 0,
          errors: [],
          message: 'Nenhum pedido órfão encontrado'
        };
      }

      // Para pedidos órfãos, vamos importar sem vendedor
      const result = await mobileOrderService.importOrders(null);
      
      const importResult: MobileOrderImportResult = {
        success: result.failed_count === 0,
        imported: result.imported_count,
        failed: result.failed_count,
        errors: result.error_messages,
        message: `Pedidos órfãos importados: ${result.imported_count}`
      };

      await checkPendingOrders(true);

      if (importResult.success && importResult.imported > 0) {
        toast.success('Pedidos órfãos importados!', {
          description: `${importResult.imported} pedidos sem vendedor foram importados`
        });
      }

      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      
      return importResult;
      
    } catch (error) {
      console.error('❌ [DEBUG] Error importing orphaned orders:', error);
      
      toast.error('Erro ao importar pedidos órfãos', {
        description: 'Não foi possível importar os pedidos sem vendedor'
      });
      
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        message: 'Falha na importação de órfãos'
      };
    } finally {
      setIsImporting(false);
    }
  }, [checkPendingOrders]);

  return {
    importMobileOrders,
    importSalesRepOrders,
    importOrphanedOrders,
    isImporting,
    pendingOrdersCount,
    checkPendingOrders,
    debugInfo
  };
};
