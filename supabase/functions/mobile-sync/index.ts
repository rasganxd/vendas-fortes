
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization header is required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } }
    }
  );

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Logging sync request for debugging
    console.log(`Mobile sync request: ${path}`);

    // Extract parameters from URL and body
    const salesRepId = url.searchParams.get('salesRepId');
    const deviceId = url.searchParams.get('deviceId') || 'unknown';

    // GET endpoints
    if (req.method === 'GET') {
      switch (path) {
        case 'get-sales-reps': {
          const { data, error } = await supabaseClient
            .from('sales_reps')
            .select('*')
            .eq('active', true);

          if (error) throw error;
          
          return new Response(
            JSON.stringify({ data, timestamp: Date.now() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'get-customers': {
          const { data, error } = await supabaseClient
            .from('customers')
            .select('*');

          if (error) throw error;
          
          return new Response(
            JSON.stringify({ data, timestamp: Date.now() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'get-products': {
          const { data, error } = await supabaseClient
            .from('products')
            .select('*');

          if (error) throw error;
          
          return new Response(
            JSON.stringify({ data, timestamp: Date.now() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'get-orders': {
          if (!salesRepId) {
            return new Response(
              JSON.stringify({ error: 'salesRepId parameter is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { data, error } = await supabaseClient
            .from('orders')
            .select('*, order_items(*)')
            .eq('sales_rep_id', salesRepId);

          if (error) throw error;
          
          // Log download event
          if (deviceId && salesRepId) {
            await logSyncEvent(supabaseClient, 'download', deviceId, salesRepId, {
              count: data?.length || 0,
              type: 'orders'
            });
          }
          
          return new Response(
            JSON.stringify({ data, timestamp: Date.now() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Unsupported endpoint' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
    }

    // POST endpoints
    if (req.method === 'POST') {
      const body = await req.json();
      
      switch (path) {
        case 'sync-orders': {
          if (!body.salesRepId || !body.deviceId || !body.orders) {
            return new Response(
              JSON.stringify({ error: 'salesRepId, deviceId, and orders are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { salesRepId, deviceId, orders } = body;
          
          // Process each order
          const processedOrderIds = [];
          for (const order of orders) {
            const orderData = {
              ...order,
              synced_from_mobile: true,
              device_id: deviceId,
              sync_timestamp: new Date().toISOString()
            };
            
            // Check if order exists
            const { data: existingOrder } = await supabaseClient
              .from('orders')
              .select('id')
              .eq('id', order.id)
              .maybeSingle();
            
            if (existingOrder) {
              // Update existing order
              const { error: updateError } = await supabaseClient
                .from('orders')
                .update(orderData)
                .eq('id', order.id);
              
              if (updateError) throw updateError;
              processedOrderIds.push(order.id);
            } else {
              // Insert new order
              const { data: newOrder, error: insertError } = await supabaseClient
                .from('orders')
                .insert(orderData)
                .select('id')
                .single();
              
              if (insertError) throw insertError;
              
              if (newOrder) {
                processedOrderIds.push(newOrder.id);
                
                // Process order items
                if (order.items && Array.isArray(order.items)) {
                  for (const item of order.items) {
                    await supabaseClient
                      .from('order_items')
                      .insert({
                        ...item,
                        order_id: newOrder.id
                      });
                  }
                }
              }
            }
          }
          
          // Log upload event
          await logSyncEvent(supabaseClient, 'upload', deviceId, salesRepId, {
            count: processedOrderIds.length,
            order_ids: processedOrderIds
          });
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              orderIds: processedOrderIds,
              timestamp: Date.now()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'log-sync': {
          if (!body.eventType || !body.deviceId || !body.salesRepId) {
            return new Response(
              JSON.stringify({ error: 'eventType, deviceId, and salesRepId are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const { eventType, deviceId, salesRepId, details } = body;
          
          // Log sync event
          await logSyncEvent(supabaseClient, eventType, deviceId, salesRepId, details);
          
          return new Response(
            JSON.stringify({ success: true, timestamp: Date.now() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Unsupported endpoint' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
    }

    // If none of the routes matched
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in mobile-sync function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to log sync events
async function logSyncEvent(
  supabaseClient: any,
  eventType: 'upload' | 'download' | 'error',
  deviceId: string,
  salesRepId: string,
  details?: any
) {
  try {
    await supabaseClient
      .from('sync_logs')
      .insert({
        event_type: eventType,
        device_id: deviceId,
        sales_rep_id: salesRepId,
        details: details || {},
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging sync event:", error);
  }
}
