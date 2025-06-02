
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

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token de autorização obrigatório'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API token
    const { data: salesRepId, error: tokenError } = await supabase
      .rpc('validate_api_token', { token_value: token });

    if (tokenError || !salesRepId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token inválido ou expirado'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      // Create new mobile order
      const orderData = await req.json();

      console.log('📱 Receiving mobile order from sales rep:', salesRepId);

      // Validate required fields
      if (!orderData.customer_id || !orderData.items || orderData.items.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Dados do pedido inválidos'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert order into orders_mobile table
      const { data: order, error: orderError } = await supabase
        .from('orders_mobile')
        .insert({
          customer_id: orderData.customer_id,
          customer_name: orderData.customer_name,
          sales_rep_id: salesRepId,
          sales_rep_name: orderData.sales_rep_name,
          date: orderData.date || new Date().toISOString(),
          due_date: orderData.due_date,
          delivery_date: orderData.delivery_date,
          total: orderData.total,
          discount: orderData.discount || 0,
          status: 'pending',
          payment_status: orderData.payment_status || 'pending',
          payment_method: orderData.payment_method,
          payment_table: orderData.payment_table,
          notes: orderData.notes,
          delivery_address: orderData.delivery_address,
          mobile_order_id: orderData.mobile_order_id,
          source_project: 'mobile'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting mobile order:', orderError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao salvar pedido'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert order items
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit: item.unit || 'UN',
        unit_price: item.unit_price,
        price: item.price,
        discount: item.discount || 0,
        total: item.total
      }));

      const { error: itemsError } = await supabase
        .from('order_items_mobile')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error inserting mobile order items:', itemsError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao salvar itens do pedido'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log order creation
      await supabase
        .from('sync_logs')
        .insert({
          sales_rep_id: salesRepId,
          event_type: 'upload',
          data_type: 'orders',
          status: 'completed',
          records_count: 1,
          metadata: {
            order_id: order.id,
            order_total: orderData.total,
            items_count: orderData.items.length,
            customer_id: orderData.customer_id
          }
        });

      console.log('✅ Mobile order saved successfully:', order.id);

      return new Response(JSON.stringify({
        success: true,
        orderId: order.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Método não permitido'
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Mobile orders error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
