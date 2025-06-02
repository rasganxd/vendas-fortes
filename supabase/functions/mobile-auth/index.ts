
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

    const { salesRepCode, password } = await req.json();

    console.log('🔐 Mobile auth attempt for sales rep code:', salesRepCode);

    // Validate input
    if (!salesRepCode || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Código do vendedor e senha são obrigatórios'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find sales rep by code
    const { data: salesRep, error: salesRepError } = await supabase
      .from('sales_reps')
      .select('*')
      .eq('code', salesRepCode)
      .eq('active', true)
      .single();

    if (salesRepError || !salesRep) {
      console.error('❌ Sales rep not found:', salesRepError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Vendedor não encontrado ou inativo'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For now, accept any password for active sales reps
    // TODO: Implement proper password hashing and validation
    console.log('✅ Sales rep authenticated:', salesRep.name);

    // Generate API token for the sales rep
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_api_token', {
        p_sales_rep_id: salesRep.id,
        p_name: `Mobile App - ${new Date().toLocaleDateString('pt-BR')}`,
        p_expires_days: 30
      });

    if (tokenError || !tokenData) {
      console.error('❌ Error generating API token:', tokenError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao gerar token de acesso'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log successful authentication
    await supabase
      .from('sync_logs')
      .insert({
        sales_rep_id: salesRep.id,
        event_type: 'mobile_login',
        data_type: 'auth',
        status: 'completed',
        metadata: {
          sales_rep_code: salesRepCode,
          login_time: new Date().toISOString(),
          platform: 'mobile'
        }
      });

    return new Response(JSON.stringify({
      success: true,
      salesRep: {
        id: salesRep.id,
        code: salesRep.code,
        name: salesRep.name,
        email: salesRep.email
      },
      token: tokenData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Mobile auth error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
