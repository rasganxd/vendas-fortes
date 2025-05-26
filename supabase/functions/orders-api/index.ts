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

    // NEW: Customers endpoint
    if (method === 'GET' && path === '/customers') {
      console.log('Fetching customers for sales rep:', currentUserId)
      
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('sales_rep_id', currentUserId)
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Error fetching customers:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar clientes', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Transform to mobile format
      const formattedCustomers = customers?.map(customer => ({
        id: customer.id,
        codigo: customer.code,
        nome: customer.name,
        razao_social: customer.company_name || '',
        endereco: customer.address || '',
        cidade: customer.city || '',
        estado: customer.state || '',
        cep: customer.zip_code || '',
        telefone: customer.phone || '',
        email: customer.email || '',
        documento: customer.document || '',
        observacoes: customer.notes || '',
        vendedor_id: customer.sales_rep_id,
        dias_visita: customer.visit_days || [],
        frequencia_visita: customer.visit_frequency || '',
        sequencia_visita: customer.visit_sequence || 0
      })) || []

      console.log(`Returning ${formattedCustomers.length} customers`)
      
      return new Response(
        JSON.stringify({ 
          customers: formattedCustomers,
          total: formattedCustomers.length 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // NEW: Products endpoint
    if (method === 'GET' && path === '/products') {
      console.log('Fetching products')
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching products:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar produtos', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Transform to mobile format
      const formattedProducts = products?.map(product => ({
        id: product.id,
        codigo: product.code,
        nome: product.name,
        descricao: product.description || '',
        preco: product.price,
        custo: product.cost || 0,
        estoque: product.stock || 0,
        estoque_minimo: product.min_stock || 0,
        unidade: product.unit || 'UN',
        grupo_id: product.group_id,
        categoria_id: product.category_id,
        marca_id: product.brand_id
      })) || []

      console.log(`Returning ${formattedProducts.length} products`)
      
      return new Response(
        JSON.stringify({ 
          products: formattedProducts,
          total: formattedProducts.length 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route handling
    if (method === 'POST' && path === '/') {
      // Create order
      const orderData: Order = await req.json()
      
      // Validate required fields
      if (!orderData.cliente || !orderData.itens || !Array.isArray(orderData.itens) || orderData.itens.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Campos obrigatórios: cliente, itens' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Calculate total if not provided
      if (!orderData.valor_total) {
        orderData.valor_total = orderData.itens.reduce((total, item) => 
          total + (item.quantidade * item.preco_unitario), 0
        )
      }

      // Generate next order code
      const { data: nextCode } = await supabase.rpc('get_next_order_code')
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          code: nextCode || 1,
          customer_name: orderData.cliente,
          date: orderData.data || new Date().toISOString(),
          status: orderData.status || 'pending',
          total: orderData.valor_total,
          sales_rep_id: orderData.vendedor_id || currentUserId,
          source_project: 'mobile'
        })
        .select()
        .single()

      if (orderError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao criar pedido', details: orderError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create order items
      const orderItems = orderData.itens.map(item => ({
        order_id: order.id,
        product_name: item.produto,
        quantity: item.quantidade,
        unit_price: item.preco_unitario,
        price: item.preco_unitario,
        total: item.quantidade * item.preco_unitario
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        // Rollback order if items creation fails
        await supabase.from('orders').delete().eq('id', order.id)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar itens do pedido', details: itemsError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          order: {
            id: order.id,
            code: order.code,
            cliente: order.customer_name,
            data: order.date,
            status: order.status,
            valor_total: order.total,
            vendedor_id: order.sales_rep_id,
            itens: orderData.itens
          }
        }),
        { 
          status: 201, 
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
          offset 
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
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Pedido não encontrado' }),
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
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar pedido', details: error.message }),
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
            vendedor_id: order.sales_rep_id
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
