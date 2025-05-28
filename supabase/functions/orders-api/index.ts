
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}

interface OrderItem {
  produto: string;
  quantidade: number;
  preco_unitario: number;
}

interface Order {
  cliente: string;
  data?: string;
  status?: string;
  itens: OrderItem[];
  valor_total: number;
  vendedor_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/orders-api', '')
    const method = req.method

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract authentication
    let currentUserId: string | null = null
    const authHeader = req.headers.get('authorization')
    const apiKeyHeader = req.headers.get('x-api-key')
    
    if (authHeader?.startsWith('Bearer ')) {
      // JWT Token authentication
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (user) {
        currentUserId = user.id
      }
    } else if (apiKeyHeader) {
      // API Key authentication
      const { data: salesRepId, error } = await supabase.rpc('validate_api_token', {
        token_value: apiKeyHeader
      })
      if (salesRepId) {
        currentUserId = salesRepId
      }
    }

    if (!currentUserId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route handling
    if (method === 'POST' && path === '/') {
      // Create order - IMPORTANTE: Agora redireciona para mobile-orders-import
      console.log('⚠️ orders-api POST detected - redirecting to mobile-orders-import');
      
      return new Response(
        JSON.stringify({ 
          error: 'Este endpoint não deve ser usado para criar pedidos mobile',
          message: 'Use o endpoint /mobile-orders-import para enviar pedidos do mobile',
          redirect_to: '/mobile-orders-import',
          documentation: 'Pedidos mobile devem passar pelo processo de importação manual'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'GET' && path === '/') {
      // List orders with filters
      const vendedorId = url.searchParams.get('vendedor_id')
      const status = url.searchParams.get('status')
      const dataInicio = url.searchParams.get('data_inicio')
      const dataFim = url.searchParams.get('data_fim')
      const cliente = url.searchParams.get('cliente')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('imported', true) // IMPORTANTE: Só mostra pedidos já importados
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (vendedorId) {
        query = query.eq('sales_rep_id', vendedorId)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (dataInicio) {
        query = query.gte('date', dataInicio)
      }
      if (dataFim) {
        query = query.lte('date', dataFim)
      }
      if (cliente) {
        query = query.ilike('customer_name', `%${cliente}%`)
      }

      const { data: orders, error } = await query

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar pedidos', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Transform to API format
      const formattedOrders = orders?.map(order => ({
        id: order.id,
        code: order.code,
        cliente: order.customer_name,
        data: order.date,
        status: order.status,
        valor_total: order.total,
        vendedor_id: order.sales_rep_id,
        imported: order.imported,
        source_project: order.source_project,
        itens: order.order_items?.map((item: any) => ({
          produto: item.product_name,
          quantidade: item.quantity,
          preco_unitario: item.unit_price
        })) || []
      })) || []

      return new Response(
        JSON.stringify({ 
          orders: formattedOrders,
          total: formattedOrders.length,
          limit,
          offset,
          note: 'Apenas pedidos importados são exibidos nesta API'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'GET' && path.startsWith('/')) {
      // Get order by ID
      const orderId = path.substring(1)
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .eq('imported', true) // IMPORTANTE: Só mostra se já foi importado
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Pedido não encontrado ou não importado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const formattedOrder = {
        id: order.id,
        code: order.code,
        cliente: order.customer_name,
        data: order.date,
        status: order.status,
        valor_total: order.total,
        vendedor_id: order.sales_rep_id,
        imported: order.imported,
        source_project: order.source_project,
        itens: order.order_items?.map((item: any) => ({
          produto: item.product_name,
          quantidade: item.quantity,
          preco_unitario: item.unit_price
        })) || []
      }

      return new Response(
        JSON.stringify(formattedOrder),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if ((method === 'PUT' || method === 'PATCH') && path.startsWith('/')) {
      // Update order
      const orderId = path.substring(1)
      const updateData = await req.json()
      
      const updates: any = {}
      if (updateData.status) updates.status = updateData.status
      if (updateData.cliente) updates.customer_name = updateData.cliente
      if (updateData.valor_total) updates.total = updateData.valor_total
      if (updateData.data) updates.date = updateData.data

      const { data: order, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .eq('imported', true) // IMPORTANTE: Só permite editar se já foi importado
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar pedido ou pedido não importado', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Pedido atualizado com sucesso',
          order: {
            id: order.id,
            code: order.code,
            cliente: order.customer_name,
            data: order.date,
            status: order.status,
            valor_total: order.total,
            vendedor_id: order.sales_rep_id,
            imported: order.imported
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'DELETE' && path.startsWith('/')) {
      // Delete order
      const orderId = path.substring(1)
      
      // Check if order is imported before allowing deletion
      const { data: orderCheck } = await supabase
        .from('orders')
        .select('imported')
        .eq('id', orderId)
        .single()

      if (!orderCheck?.imported) {
        return new Response(
          JSON.stringify({ error: 'Não é possível excluir pedido não importado via API' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Delete order items first
      await supabase.from('order_items').delete().eq('order_id', orderId)
      
      // Delete order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao excluir pedido', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Pedido excluído com sucesso' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Endpoint não encontrado' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
