
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MobileOrder {
  code?: number;
  customerId: string;
  customerName: string;
  salesRepId: string;
  salesRepName: string;
  date: string;
  dueDate?: string;
  deliveryDate?: string;
  items: MobileOrderItem[];
  total: number;
  discount?: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentMethodId?: string;
  paymentTableId?: string;
  notes?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  mobileOrderId?: string;
}

interface MobileOrderItem {
  productId: string;
  productName: string;
  productCode: number;
  quantity: number;
  unitPrice: number;
  price: number;
  discount?: number;
  total: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Validate sync token
    const { data: tokenData, error: tokenError } = await supabase
      .from('sync_tokens')
      .select('sales_rep_id')
      .eq('token', token)
      .eq('active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error('Invalid token:', tokenError);
      await logImportEvent(supabase, 'error', 'orders', 0, undefined, undefined, undefined, 'Invalid or expired token');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const salesRepId = tokenData.sales_rep_id;
    const { orders } = await req.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No orders provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📱 Importing ${orders.length} orders from mobile for sales rep: ${salesRepId}`);

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process orders in batches
    for (const orderData of orders) {
      try {
        await importSingleOrder(supabase, orderData, salesRepId);
        results.imported++;
        console.log(`✅ Order imported successfully: ${orderData.code || orderData.mobileOrderId}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to import order ${orderData.code || orderData.mobileOrderId}: ${error.message}`;
        results.errors.push(errorMsg);
        console.error('❌', errorMsg);
      }
    }

    // Log the import event
    await logImportEvent(
      supabase, 
      results.failed > 0 ? 'error' : 'upload', 
      'orders', 
      results.imported, 
      salesRepId,
      undefined,
      undefined,
      results.failed > 0 ? `${results.failed} orders failed to import` : undefined,
      { 
        total_orders: orders.length,
        imported: results.imported,
        failed: results.failed,
        errors: results.errors
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${results.imported} orders, ${results.failed} failed`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Critical error in mobile orders import:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function importSingleOrder(supabase: any, orderData: MobileOrder, salesRepId: string) {
  console.log(`📝 Processing order: ${orderData.code || orderData.mobileOrderId}`);

  // Validate required fields
  if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
    throw new Error('Missing required fields: customerId or items');
  }

  // Validate customer exists
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, name')
    .eq('id', orderData.customerId)
    .single();

  if (customerError || !customer) {
    throw new Error(`Customer not found: ${orderData.customerId}`);
  }

  // Validate sales rep
  const { data: salesRep, error: salesRepError } = await supabase
    .from('sales_reps')
    .select('id, name')
    .eq('id', salesRepId)
    .single();

  if (salesRepError || !salesRep) {
    throw new Error(`Sales rep not found: ${salesRepId}`);
  }

  // Check for duplicate orders
  const duplicateFilters = [];
  if (orderData.code) {
    duplicateFilters.push(supabase.from('orders').select('id').eq('code', orderData.code));
  }
  if (orderData.mobileOrderId) {
    duplicateFilters.push(supabase.from('orders').select('id').eq('mobile_order_id', orderData.mobileOrderId));
  }

  if (duplicateFilters.length > 0) {
    const duplicateChecks = await Promise.all(duplicateFilters);
    for (const check of duplicateChecks) {
      if (check.data && check.data.length > 0) {
        throw new Error(`Duplicate order found: ${orderData.code || orderData.mobileOrderId}`);
      }
    }
  }

  // Generate order code if not provided
  let orderCode = orderData.code;
  if (!orderCode) {
    const { data: nextCode, error: codeError } = await supabase.rpc('get_next_order_code');
    if (codeError) {
      throw new Error(`Failed to generate order code: ${codeError.message}`);
    }
    orderCode = nextCode;
  }

  // Prepare order data
  const dbOrder = {
    code: orderCode,
    customer_id: orderData.customerId,
    customer_name: customer.name,
    sales_rep_id: salesRepId,
    sales_rep_name: salesRep.name,
    date: orderData.date,
    due_date: orderData.dueDate || null,
    delivery_date: orderData.deliveryDate || null,
    total: orderData.total || 0,
    discount: orderData.discount || 0,
    status: orderData.status || 'pending',
    payment_status: orderData.paymentStatus || 'pending',
    payment_method: orderData.paymentMethod || '',
    payment_method_id: orderData.paymentMethodId || null,
    payment_table_id: orderData.paymentTableId || null,
    notes: orderData.notes || '',
    delivery_address: orderData.deliveryAddress || '',
    delivery_city: orderData.deliveryCity || '',
    delivery_state: orderData.deliveryState || '',
    delivery_zip: orderData.deliveryZip || '',
    source_project: 'mobile',
    mobile_order_id: orderData.mobileOrderId || null,
    sync_status: 'synced'
  };

  // Insert order
  const { data: insertedOrder, error: orderError } = await supabase
    .from('orders')
    .insert(dbOrder)
    .select('id')
    .single();

  if (orderError) {
    throw new Error(`Failed to insert order: ${orderError.message}`);
  }

  console.log(`✅ Order inserted with ID: ${insertedOrder.id}`);

  // Insert order items
  const dbItems = orderData.items.map(item => ({
    order_id: insertedOrder.id,
    product_id: item.productId || null,
    product_name: item.productName,
    product_code: item.productCode || 0,
    quantity: item.quantity,
    unit_price: item.unitPrice || item.price,
    price: item.price,
    discount: item.discount || 0,
    total: item.total
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(dbItems);

  if (itemsError) {
    // Rollback order if items fail
    await supabase.from('orders').delete().eq('id', insertedOrder.id);
    throw new Error(`Failed to insert order items: ${itemsError.message}`);
  }

  console.log(`✅ Inserted ${dbItems.length} order items`);
}

async function logImportEvent(
  supabase: any,
  eventType: string,
  dataType: string,
  recordsCount: number,
  salesRepId?: string,
  deviceId?: string,
  deviceIp?: string,
  errorMessage?: string,
  metadata?: any
) {
  try {
    await supabase.from('sync_logs').insert({
      sales_rep_id: salesRepId || null,
      event_type: eventType,
      device_id: deviceId,
      device_ip: deviceIp,
      data_type: dataType,
      records_count: recordsCount,
      status: eventType === 'error' ? 'failed' : 'completed',
      error_message: errorMessage,
      metadata: metadata
    });
  } catch (error) {
    console.error('Failed to log import event:', error);
  }
}
