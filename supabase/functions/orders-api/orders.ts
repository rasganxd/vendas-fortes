
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, Order } from './types.ts';

export async function handleOrdersPost(req: Request, currentUserId: string): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const orderData: Order = await req.json();
  
  // Validate required fields
  if (!orderData.cliente || !orderData.itens || !Array.isArray(orderData.itens) || orderData.itens.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Campos obrigatórios: cliente, itens' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Calculate total if not provided
  if (!orderData.valor_total) {
    orderData.valor_total = orderData.itens.reduce((total, item) => 
      total + (item.quantidade * item.preco_unitario), 0
    );
  }

  // Generate next order code
  const { data: nextCode } = await supabase.rpc('get_next_order_code');
  
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
    .single();

  if (orderError) {
    return new Response(
      JSON.stringify({ error: 'Erro ao criar pedido', details: orderError.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Create order items
  const orderItems = orderData.itens.map(item => ({
    order_id: order.id,
    product_name: item.produto,
    quantity: item.quantidade,
    unit_price: item.preco_unitario,
    price: item.preco_unitario,
    total: item.quantidade * item.preco_unitario
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback order if items creation fails
    await supabase.from('orders').delete().eq('id', order.id);
    return new Response(
      JSON.stringify({ error: 'Erro ao criar itens do pedido', details: itemsError.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
  );
}

export async function handleOrdersGet(url: URL): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const vendedorId = url.searchParams.get('vendedor_id');
  const status = url.searchParams.get('status');
  const dataInicio = url.searchParams.get('data_inicio');
  const dataFim = url.searchParams.get('data_fim');
  const cliente = url.searchParams.get('cliente');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (vendedorId) {
    query = query.eq('sales_rep_id', vendedorId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (dataInicio) {
    query = query.gte('date', dataInicio);
  }
  if (dataFim) {
    query = query.lte('date', dataFim);
  }
  if (cliente) {
    query = query.ilike('customer_name', `%${cliente}%`);
  }

  const { data: orders, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar pedidos', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
  })) || [];

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
  );
}

export async function handleOrderById(orderId: string): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Pedido não encontrado' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
  };

  return new Response(
    JSON.stringify(formattedOrder),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export async function handleOrderUpdate(req: Request, orderId: string): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const updateData = await req.json();
  
  const updates: any = {};
  if (updateData.status) updates.status = updateData.status;
  if (updateData.cliente) updates.customer_name = updateData.cliente;
  if (updateData.valor_total) updates.total = updateData.valor_total;
  if (updateData.data) updates.date = updateData.data;

  const { data: order, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar pedido', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
  );
}

export async function handleOrderDelete(orderId: string): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Delete order items first
  await supabase.from('order_items').delete().eq('order_id', orderId);
  
  // Delete order
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao excluir pedido', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Pedido excluído com sucesso' }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
