
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

  const importMobileOrders = useCallback(async (): Promise<MobileOrderImportResult> => {
    try {
      setIsImporting(true);
      console.log('🚀 Starting mobile order import process...');

      // Get pending orders from Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: pendingOrders, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('source_project', 'mobile')
        .eq('imported', false)
        .order('created_at', { ascending: false });

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
          message: 'Nenhum pedido pendente para importação'
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

          // Transform and add to local system
          const orderToImport = {
            id: orderData.id,
            code: orderData.code,
            customerId: orderData.customer_id,
            customerName: orderData.customer_name || '',
            salesRepId: orderData.sales_rep_id,
            salesRepName: orderData.sales_rep_name || '',
            date: new Date(orderData.date),
            dueDate: orderData.due_date ? new Date(orderData.due_date) : new Date(),
            deliveryDate: orderData.delivery_date ? new Date(orderData.delivery_date) : undefined,
            items: (orderData.order_items || []).map((item: any) => ({
              id: item.id,
              orderId: item.order_id,
              productId: item.product_id,
              productName: item.product_name,
              productCode: item.product_code,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unit_price || item.price),
              price: Number(item.price),
              discount: Number(item.discount || 0),
              total: Number(item.total)
            })),
            total: Number(orderData.total),
            discount: Number(orderData.discount || 0),
            status: orderData.status as any,
            paymentStatus: orderData.payment_status as any,
            paymentMethod: orderData.payment_method || '',
            paymentMethodId: orderData.payment_method_id || '',
            paymentTableId: orderData.payment_table_id || '',
            payments: Array.isArray(orderData.payments) ? orderData.payments : [],
            notes: orderData.notes || '',
            createdAt: new Date(orderData.created_at),
            updatedAt: new Date(orderData.updated_at),
            archived: orderData.archived || false,
            deliveryAddress: orderData.delivery_address || '',
            deliveryCity: orderData.delivery_city || '',
            deliveryState: orderData.delivery_state || '',
            deliveryZip: orderData.delivery_zip || ''
          };

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
        status: failed > 0 ? 'partial' : 'completed',
        error_message: failed > 0 ? `${failed} pedidos falharam` : null,
        metadata: {
          imported,
          failed,
          errors: errors.slice(0, 5) // Log only first 5 errors
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
          description: `${imported} pedidos foram importados`
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

  return {
    importMobileOrders,
    isImporting,
    pendingOrdersCount,
    checkPendingOrders
  };
};
