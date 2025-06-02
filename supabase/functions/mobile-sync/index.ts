
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

    console.log('📱 Sync request for sales rep:', salesRepId);

    // Get customers for this sales rep
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('sales_rep_id', salesRepId)
      .eq('active', true)
      .order('name');

    if (customersError) {
      console.error('Error fetching customers:', customersError);
    }

    // Get all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_brands!inner(name),
        product_categories(name),
        product_groups(name)
      `)
      .eq('active', true)
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Get active payment tables
    const { data: paymentTables, error: paymentError } = await supabase
      .from('payment_tables')
      .select('*')
      .eq('active', true)
      .order('name');

    if (paymentError) {
      console.error('Error fetching payment tables:', paymentError);
    }

    // Log sync event
    await supabase
      .from('sync_logs')
      .insert({
        sales_rep_id: salesRepId,
        event_type: 'sync',
        data_type: 'mobile_data',
        status: 'completed',
        records_count: (customers?.length || 0) + (products?.length || 0) + (paymentTables?.length || 0),
        metadata: {
          customers_count: customers?.length || 0,
          products_count: products?.length || 0,
          payment_tables_count: paymentTables?.length || 0,
          sync_time: new Date().toISOString()
        }
      });

    return new Response(JSON.stringify({
      success: true,
      data: {
        customers: customers || [],
        products: products || [],
        paymentTables: paymentTables || [],
        lastSync: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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
