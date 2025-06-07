
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  code: number;
  password: string;
}

Deno.serve(async (req) => {
  console.log(`🔐 [sales-rep-login] ${req.method} request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code, password }: LoginRequest = await req.json();
    console.log(`🔐 [sales-rep-login] Attempting login for code: ${code}`);

    if (!code || !password) {
      console.log(`❌ [sales-rep-login] Missing credentials - code: ${!!code}, password: ${!!password}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Código e senha são obrigatórios' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get sales rep by code
    console.log(`🔍 [sales-rep-login] Looking for sales rep with code: ${code}`);
    const { data: salesRep, error: salesRepError } = await supabase
      .from('sales_reps')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (salesRepError || !salesRep) {
      console.log(`❌ [sales-rep-login] Sales rep not found for code: ${code}`, salesRepError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Vendedor não encontrado ou inativo' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ [sales-rep-login] Found sales rep: ${salesRep.name} (ID: ${salesRep.id})`);

    // Check if password is set
    if (!salesRep.password) {
      console.log(`❌ [sales-rep-login] No password set for sales rep: ${salesRep.name}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Senha não configurada para este vendedor. Entre em contato com o administrador.' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify password using the database function
    console.log(`🔐 [sales-rep-login] Verifying password for: ${salesRep.name}`);
    const { data: isValidPassword, error: passwordError } = await supabase
      .rpc('verify_password', {
        password: password,
        hash: salesRep.password
      });

    if (passwordError) {
      console.log(`❌ [sales-rep-login] Password verification error:`, passwordError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro na verificação da senha. Tente novamente.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidPassword) {
      console.log(`❌ [sales-rep-login] Invalid password for code: ${code}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Código ou senha incorretos' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate a mobile session token
    const sessionToken = `mobile_session_${salesRep.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log(`✅ [sales-rep-login] Login successful for: ${salesRep.name}`);
    console.log(`🎫 [sales-rep-login] Generated session token for: ${salesRep.name}`);

    // Return sales rep data without password and with session token
    const { password: _, ...salesRepData } = salesRep;

    return new Response(JSON.stringify({ 
      success: true, 
      salesRep: salesRepData,
      sessionToken: sessionToken,
      expiresAt: expiresAt.toISOString(),
      message: `Bem-vindo, ${salesRep.name}!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [sales-rep-login] Critical error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno durante autenticação. Tente novamente.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
