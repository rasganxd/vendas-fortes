
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
      
      console.log('🔍 Checking all pending mobile orders...');
      
      // Buscar TODOS os pedidos pendentes na tabela orders_mobile (incluindo órfãos)
      const { data, error } = await supabase
        .from('orders_mobile')
        .select('id, sales_rep_id, sales_rep_name, customer_name', { count: 'exact' })
        .eq('imported', false);

      if (error) {
        console.error('❌ Error checking pending orders:', error);
        throw error;
      }
      
      const count = data?.length || 0;
      console.log(`✅ Found ${count} pending mobile orders total`);
      
      // Log detalhado dos pedidos encontrados
      if (data && data.length > 0) {
        const withSalesRep = data.filter(order => order.sales_rep_id);
        const orphaned = data.filter(order => !order.sales_rep_id);
        
        console.log(`📊 Orders breakdown:
          - With sales rep: ${withSalesRep.length}
          - Orphaned (no sales rep): ${orphaned.length}
          - Total: ${count}`);
        
        if (orphaned.length > 0) {
          console.log('⚠️ Orphaned orders found:', orphaned.map(o => ({
            id: o.id,
            customer: o.customer_name
          })));
        }
      }
      
      setPendingOrdersCount(count);
      return count;
    } catch (error) {
      console.error('❌ Error checking pending orders:', error);
      return 0;
    }
  }, []);

  const importMobileOrders = useCallback(async (salesRepId?: string): Promise<MobileOrderImportResult> => {
    try {
      setIsImporting(true);
      console.log('🚀 Starting mobile order import process...', salesRepId ? `for sales rep: ${salesRepId}` : 'for all orders');

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

  const importOrphanedOrders = useCallback(async (): Promise<MobileOrderImportResult> => {
    console.log('🔄 Importing orphaned orders (no sales rep)');
    
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

      await checkPendingOrders();

      if (importResult.success && importResult.imported > 0) {
        toast.success('Pedidos órfãos importados!', {
          description: `${importResult.imported} pedidos sem vendedor foram importados`
        });
      }

      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      
      return importResult;
      
    } catch (error) {
      console.error('❌ Error importing orphaned orders:', error);
      
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
    checkPendingOrders
  };
};
