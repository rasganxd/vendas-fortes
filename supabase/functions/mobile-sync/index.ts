
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper function to transform from snake_case to camelCase
 */
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert data from DB to camelCase format
 */
const transformData = (data: any[]): any[] => {
  return data.map(item => {
    const result: Record<string, any> = {};
    
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const camelKey = snakeToCamel(key);
        result[camelKey] = item[key];
      }
    }
    
    return result;
  });
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the URL to extract the action
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Get auth token from request
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    // Verify auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', status: 401 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    if (req.method === 'GET') {
      switch (action) {
        case 'get-sales-reps': {
          const { data, error } = await supabase
            .from('sales_reps')
            .select('*')
            .eq('active', true);
            
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ 
              data: transformData(data), 
              timestamp: Date.now() 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'get-customers': {
          const { data, error } = await supabase
            .from('customers')
            .select('*');
            
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ 
              data: transformData(data), 
              timestamp: Date.now() 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'get-products': {
          const { data, error } = await supabase
            .from('products')
            .select('*');
            
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ 
              data: transformData(data), 
              timestamp: Date.now() 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'get-orders': {
          const salesRepId = url.searchParams.get('sales_rep_id');
          let query = supabase.from('orders').select('*, order_items(*)');
          
          if (salesRepId) {
            query = query.eq('sales_rep_id', salesRepId);
          }
            
          const { data, error } = await query;
            
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ 
              data: transformData(data), 
              timestamp: Date.now() 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        default:
          return new Response(
            JSON.stringify({ error: 'Unknown action', status: 400 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
      }
    } 
    else if (req.method === 'POST') {
      // Parse request body
      const requestData = await req.json();
      
      switch (action) {
        case 'sync-orders': {
          const { orders = [], deviceId, salesRepId } = requestData;
          
          if (!Array.isArray(orders) || orders.length === 0) {
            return new Response(
              JSON.stringify({ error: 'Invalid orders data', status: 400 }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }

          if (!deviceId || !salesRepId) {
            return new Response(
              JSON.stringify({ error: 'Missing device ID or sales rep ID', status: 400 }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }

          const processedOrderIds: string[] = [];
          
          // Process each order
          for (const order of orders) {
            // Transform camelCase to snake_case for DB
            const dbOrder: Record<string, any> = {};
            for (const key in order) {
              if (key === 'items') continue; // Handle items separately
              if (Object.prototype.hasOwnProperty.call(order, key)) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                dbOrder[snakeKey] = order[key];
              }
            }
            
            // Check if order already exists
            const { data: existingOrder } = await supabase
              .from('orders')
              .select('id')
              .eq('id', order.id)
              .maybeSingle();

            if (existingOrder) {
              // Order exists, update it
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  ...dbOrder,
                  updated_at: new Date().toISOString(),
                  synced_from_mobile: true,
                  device_id: deviceId
                })
                .eq('id', order.id);

              if (!updateError) {
                processedOrderIds.push(order.id);
              }
            } else {
              // New order, insert it
              const { data: newOrder, error: insertError } = await supabase
                .from('orders')
                .insert({
                  ...dbOrder,
                  synced_from_mobile: true,
                  device_id: deviceId,
                  sales_rep_id: salesRepId
                })
                .select('id')
                .single();

              if (!insertError && newOrder) {
                processedOrderIds.push(newOrder.id);

                // Process order items
                if (order.items && Array.isArray(order.items)) {
                  for (const item of order.items) {
                    // Transform camelCase to snake_case for items
                    const dbItem: Record<string, any> = {};
                    for (const key in item) {
                      if (Object.prototype.hasOwnProperty.call(item, key)) {
                        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                        dbItem[snakeKey] = item[key];
                      }
                    }
                    
                    await supabase
                      .from('order_items')
                      .insert({
                        ...dbItem,
                        order_id: newOrder.id
                      });
                  }
                }
              }
            }
          }

          // Log sync event
          await supabase
            .from('sync_logs')
            .insert({
              event_type: 'upload',
              device_id: deviceId,
              sales_rep_id: salesRepId,
              details: { order_count: orders.length },
              created_at: new Date().toISOString()
            });

          return new Response(
            JSON.stringify({
              success: true,
              processedOrderIds,
              timestamp: Date.now()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'log-sync': {
          const { eventType, deviceId, salesRepId, details } = requestData;
          
          await supabase
            .from('sync_logs')
            .insert({
              event_type: eventType,
              device_id: deviceId,
              sales_rep_id: salesRepId,
              details,
              created_at: new Date().toISOString()
            });
            
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        default:
          return new Response(
            JSON.stringify({ error: 'Unknown action', status: 400 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed', status: 405 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message, status: 500 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
