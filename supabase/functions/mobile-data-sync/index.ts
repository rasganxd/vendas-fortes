
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  salesRepCode?: number;
  lastSync?: string;
  action?: 'get_sales_rep' | 'get_customers' | 'get_products' | 'sync_orders';
}

Deno.serve(async (req) => {
  console.log(`📱 [mobile-data-sync] ${req.method} request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { salesRepCode, action, lastSync }: SyncRequest = await req.json();
    console.log(`📱 [mobile-data-sync] Action: ${action}, Sales Rep Code: ${salesRepCode}`);

    switch (action) {
      case 'get_sales_rep':
        if (!salesRepCode) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Sales rep code is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: salesRep, error: salesRepError } = await supabase
          .from('sales_reps')
          .select('*')
          .eq('code', salesRepCode)
          .eq('active', true)
          .single();

        if (salesRepError || !salesRep) {
          console.log(`❌ [mobile-data-sync] Sales rep not found: ${salesRepCode}`);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Sales rep not found' 
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          salesRep: {
            id: salesRep.id,
            code: salesRep.code,
            name: salesRep.name,
            phone: salesRep.phone,
            email: salesRep.email,
            active: salesRep.active
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'get_customers':
        if (!salesRepCode) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Sales rep code is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // First get the sales rep ID
        const { data: rep, error: repError } = await supabase
          .from('sales_reps')
          .select('id')
          .eq('code', salesRepCode)
          .single();

        if (repError || !rep) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Sales rep not found' 
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('sales_rep_id', rep.id)
          .eq('active', true);

        if (customersError) {
          console.log(`❌ [mobile-data-sync] Error fetching customers:`, customersError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error fetching customers' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          customers: customers || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'get_products':
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_groups(name),
            product_categories(name),
            product_brands(name)
          `)
          .eq('active', true);

        if (productsError) {
          console.log(`❌ [mobile-data-sync] Error fetching products:`, productsError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error fetching products' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          products: products || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'sync_orders':
        // Get orders for the sales rep
        const { data: repForOrders, error: repOrdersError } = await supabase
          .from('sales_reps')
          .select('id')
          .eq('code', salesRepCode)
          .single();

        if (repOrdersError || !repForOrders) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Sales rep not found' 
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let ordersQuery = supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .eq('sales_rep_id', repForOrders.id);

        // Add lastSync filter if provided
        if (lastSync) {
          ordersQuery = ordersQuery.gte('updated_at', lastSync);
        }

        const { data: orders, error: ordersError } = await ordersQuery;

        if (ordersError) {
          console.log(`❌ [mobile-data-sync] Error fetching orders:`, ordersError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Error fetching orders' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          orders: orders || [],
          syncTime: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('❌ [mobile-data-sync] Critical error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
