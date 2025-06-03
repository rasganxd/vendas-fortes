
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, sales_rep_id, last_sync, orders } = await req.json();

    console.log('🔄 Mobile sync request:', { action, sales_rep_id, last_sync });

    switch (action) {
      case 'get_sync_data':
        return await getSyncData(supabase, sales_rep_id, last_sync);
      
      case 'upload_orders':
        return await uploadOrders(supabase, orders, sales_rep_id);
      
      case 'get_statistics':
        return await getSyncStatistics(supabase);
      
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Ação não reconhecida'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('❌ Mobile sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getSyncData(supabase: any, salesRepId: string, lastSync?: string) {
  try {
    console.log('📥 Getting sync data for sales rep:', salesRepId);

    // Chamar função do banco para obter dados atualizados
    const { data, error } = await supabase.rpc('get_sync_data_for_sales_rep', {
      p_sales_rep_id: salesRepId,
      p_last_sync: lastSync || null
    });

    if (error) {
      console.error('❌ Error getting sync data:', error);
      throw error;
    }

    const syncData = data[0] || {};

    // Log da sincronização
    await supabase.from('sync_logs').insert({
      sales_rep_id: salesRepId,
      event_type: 'download',
      data_type: 'sync_data',
      records_count: (syncData.products_updated?.length || 0) + (syncData.customers_updated?.length || 0),
      status: 'completed',
      metadata: {
        products_count: syncData.products_updated?.length || 0,
        customers_count: syncData.customers_updated?.length || 0,
        last_sync: lastSync,
        sync_timestamp: syncData.sync_timestamp
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        products: syncData.products_updated || [],
        customers: syncData.customers_updated || [],
        sync_timestamp: syncData.sync_timestamp,
        summary: {
          products_updated: syncData.products_updated?.length || 0,
          customers_updated: syncData.customers_updated?.length || 0
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in getSyncData:', error);
    throw error;
  }
}

async function uploadOrders(supabase: any, orders: any[], salesRepId: string) {
  try {
    console.log('📤 Uploading orders from mobile:', orders.length);

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum pedido para sincronizar',
        uploaded: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let uploaded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        // Inserir pedido na tabela orders_mobile
        const { data: orderData, error: orderError } = await supabase
          .from('orders_mobile')
          .insert({
            code: order.code,
            customer_id: order.customer_id,
            customer_name: order.customer_name,
            sales_rep_id: salesRepId,
            sales_rep_name: order.sales_rep_name,
            date: order.date,
            due_date: order.due_date,
            delivery_date: order.delivery_date,
            total: order.total,
            discount: order.discount || 0,
            status: order.status || 'pending',
            payment_status: order.payment_status || 'pending',
            payment_method: order.payment_method,
            payment_method_id: order.payment_method_id,
            payment_table_id: order.payment_table_id,
            payment_table: order.payment_table,
            payments: order.payments || [],
            notes: order.notes,
            delivery_address: order.delivery_address,
            delivery_city: order.delivery_city,
            delivery_state: order.delivery_state,
            delivery_zip: order.delivery_zip,
            mobile_order_id: order.mobile_order_id,
            sync_status: 'pending'
          })
          .select('id')
          .single();

        if (orderError) {
          console.error('❌ Error inserting order:', orderError);
          failed++;
          errors.push(`Erro no pedido ${order.code}: ${orderError.message}`);
          continue;
        }

        const orderId = orderData.id;

        // Inserir itens do pedido
        if (order.items && order.items.length > 0) {
          const orderItems = order.items.map((item: any) => ({
            order_id: orderId,
            product_name: item.product_name,
            product_code: item.product_code,
            quantity: item.quantity,
            unit_price: item.unit_price || item.price,
            price: item.price,
            discount: item.discount || 0,
            total: item.total,
            unit: item.unit || 'UN'
          }));

          const { error: itemsError } = await supabase
            .from('order_items_mobile')
            .insert(orderItems);

          if (itemsError) {
            console.error('❌ Error inserting order items:', itemsError);
            // Remover pedido se falhou ao inserir itens
            await supabase.from('orders_mobile').delete().eq('id', orderId);
            failed++;
            errors.push(`Erro nos itens do pedido ${order.code}: ${itemsError.message}`);
            continue;
          }
        }

        uploaded++;
        console.log(`✅ Order ${order.code} uploaded successfully`);

      } catch (error) {
        console.error(`❌ Error processing order ${order.code}:`, error);
        failed++;
        errors.push(`Erro no pedido ${order.code}: ${error}`);
      }
    }

    // Log da operação
    await supabase.from('sync_logs').insert({
      sales_rep_id: salesRepId,
      event_type: 'upload',
      data_type: 'orders',
      records_count: uploaded,
      status: failed > 0 ? 'partial' : 'completed',
      error_message: errors.length > 0 ? errors.join('; ') : null,
      metadata: {
        total_orders: orders.length,
        uploaded: uploaded,
        failed: failed,
        errors: errors
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: `${uploaded} pedidos sincronizados com sucesso`,
      uploaded: uploaded,
      failed: failed,
      errors: errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in uploadOrders:', error);
    throw error;
  }
}

async function getSyncStatistics(supabase: any) {
  try {
    console.log('📊 Getting sync statistics');

    const { data, error } = await supabase.rpc('get_sync_statistics');

    if (error) {
      console.error('❌ Error getting sync statistics:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      statistics: data || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in getSyncStatistics:', error);
    throw error;
  }
}
