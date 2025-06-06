
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Sales rep login API called');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { code, password } = await req.json();

    if (!code || !password) {
      console.log('❌ Missing code or password');
      return new Response(
        JSON.stringify({ error: 'Código e senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔍 Attempting login for sales rep code: ${code}`);

    // Get sales rep by code
    const { data: salesRep, error: fetchError } = await supabase
      .from('sales_reps')
      .select('id, code, name, phone, email, password, active')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (fetchError || !salesRep) {
      console.log('❌ Sales rep not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Vendedor não encontrado ou inativo' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!salesRep.password) {
      console.log('❌ Sales rep has no password set');
      return new Response(
        JSON.stringify({ error: 'Senha não configurada para este vendedor' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify password using database function
    const { data: isValidPassword, error: verifyError } = await supabase
      .rpc('verify_password', { 
        password: password, 
        hash: salesRep.password 
      });

    if (verifyError) {
      console.log('❌ Error verifying password:', verifyError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password for sales rep:', code);
      return new Response(
        JSON.stringify({ error: 'Código ou senha incorretos' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Sales rep login successful:', salesRep.name);

    // Return sales rep data without password
    const { password: _, ...salesRepData } = salesRep;
    
    return new Response(
      JSON.stringify({
        success: true,
        salesRep: salesRepData,
        message: 'Login realizado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Critical error in sales rep login:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
