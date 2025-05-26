
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  action: 'upload' | 'download' | 'status';
  token: string;
  data?: any;
  dataType?: 'orders' | 'customers' | 'products';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, token, data, dataType }: SyncRequest = await req.json()

    // Verificar token de sincronização
    const { data: syncToken, error: tokenError } = await supabaseClient
      .from('sync_tokens')
      .select('*, sales_reps(*)')
      .eq('token', token)
      .eq('active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !syncToken) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log da operação
    await supabaseClient
      .from('sync_logs')
      .insert({
        sync_token_id: syncToken.id,
        sales_rep_id: syncToken.sales_rep_id,
        event_type: action,
        data_type: dataType,
        status: 'processing',
        device_id: syncToken.device_id,
        device_ip: syncToken.device_ip
      })

    let result = null
    let logStatus = 'completed'
    let errorMessage = null

    switch (action) {
      case 'upload':
        try {
          // Upload de pedidos do mobile para o admin
          if (dataType === 'orders' && data?.orders) {
            for (const order of data.orders) {
              // Processar cada pedido
              const orderData = {
                ...order,
                source_project: 'mobile',
                mobile_order_id: order.id,
                sync_status: 'synced',
                sales_rep_id: syncToken.sales_rep_id,
                sales_rep_name: syncToken.sales_reps?.name
              }
              
              delete orderData.id // Remove ID para gerar novo
              
              const { data: newOrder, error: orderError } = await supabaseClient
                .from('orders')
                .insert(orderData)
                .select()
                .single()

              if (orderError) {
                throw new Error(`Erro ao inserir pedido: ${orderError.message}`)
              }

              // Inserir itens do pedido
              if (order.items && order.items.length > 0) {
                const orderItems = order.items.map(item => ({
                  ...item,
                  order_id: newOrder.id
                }))

                const { error: itemsError } = await supabaseClient
                  .from('order_items')
                  .insert(orderItems)

                if (itemsError) {
                  throw new Error(`Erro ao inserir itens: ${itemsError.message}`)
                }
              }
            }
            
            result = { message: `${data.orders.length} pedidos sincronizados com sucesso` }
          }
        } catch (error) {
          logStatus = 'failed'
          errorMessage = error.message
          throw error
        }
        break

      case 'download':
        try {
          // Download de dados do admin para o mobile
          const downloadData = {}

          if (dataType === 'products' || !dataType) {
            const { data: products } = await supabaseClient
              .from('products')
              .select('*')
              .order('name')
            downloadData.products = products || []
          }

          if (dataType === 'customers' || !dataType) {
            const { data: customers } = await supabaseClient
              .from('customers')
              .select('*')
              .eq('sales_rep_id', syncToken.sales_rep_id)
              .order('name')
            downloadData.customers = customers || []
          }

          if (dataType === 'payment_methods' || !dataType) {
            const { data: paymentMethods } = await supabaseClient
              .from('payment_methods')
              .select('*')
              .order('name')
            downloadData.paymentMethods = paymentMethods || []
          }

          if (dataType === 'payment_tables' || !dataType) {
            const { data: paymentTables } = await supabaseClient
              .from('payment_tables')
              .select('*')
              .eq('active', true)
              .order('name')
            downloadData.paymentTables = paymentTables || []
          }

          result = downloadData
        } catch (error) {
          logStatus = 'failed'
          errorMessage = error.message
          throw error
        }
        break

      case 'status':
        // Retornar status da sincronização
        const { data: logs } = await supabaseClient
          .from('sync_logs')
          .select('*')
          .eq('sales_rep_id', syncToken.sales_rep_id)
          .order('created_at', { ascending: false })
          .limit(10)

        result = {
          status: 'connected',
          salesRep: syncToken.sales_reps,
          lastSync: logs?.[0]?.created_at || null,
          recentLogs: logs || []
        }
        break

      default:
        throw new Error('Ação não suportada')
    }

    // Atualizar log com sucesso
    await supabaseClient
      .from('sync_logs')
      .update({
        status: logStatus,
        error_message: errorMessage,
        records_count: Array.isArray(result?.orders) ? result.orders.length : 
                      Array.isArray(result?.products) ? result.products.length : 1
      })
      .eq('sync_token_id', syncToken.id)
      .eq('status', 'processing')

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na sincronização:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
