
import { useState, useCallback } from 'react';
import { mobileOrderImportService, MobileOrderImportResult } from '@/services/supabase/mobileOrderImportService';
import { mobileOrderService } from '@/services/supabase/mobileOrderService';
import { toast } from 'sonner';

export const useMobileOrderImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const checkPendingOrders = useCallback(async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Buscar pedidos pendentes na tabela correta (orders_mobile)
      const { data, error } = await supabase
        .from('orders_mobile')
        .select('id', { count: 'exact' })
        .eq('imported', false);

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

      // Update pending count
      await checkPendingOrders();

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

      console.log('✅ Mobile order import process completed:', importResult);
      return importResult;

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
