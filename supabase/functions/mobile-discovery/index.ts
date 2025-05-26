
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscoveryRequest {
  salesRepId: string;
  deviceId?: string;
  deviceIp?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { salesRepId, deviceId, deviceIp }: DiscoveryRequest = await req.json()

    // Verificar se o vendedor existe
    const { data: salesRep, error: salesRepError } = await supabaseClient
      .from('sales_reps')
      .select('*')
      .eq('id', salesRepId)
      .eq('active', true)
      .single()

    if (salesRepError || !salesRep) {
      return new Response(
        JSON.stringify({ error: 'Vendedor não encontrado ou inativo' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gerar token de sincronização
    const { data: tokenData, error: tokenError } = await supabaseClient
      .rpc('generate_sync_token', {
        p_sales_rep_id: salesRepId,
        p_project_type: 'mobile',
        p_device_id: deviceId,
        p_device_ip: deviceIp,
        p_expires_minutes: 60
      })

    if (tokenError || !tokenData?.[0]) {
      throw new Error('Erro ao gerar token de sincronização')
    }

    const { token, expires_at } = tokenData[0]

    // Configuração da API móvel
    const baseUrl = req.headers.get('origin') || 'https://ufvnubabpcyimahbubkd.supabase.co'
    
    const connectionData = {
      token,
      expires_at,
      salesRep: {
        id: salesRep.id,
        name: salesRep.name,
        code: salesRep.code
      },
      serverUrl: baseUrl,
      endpoints: {
        sync: `${baseUrl}/functions/v1/mobile-sync`,
        discovery: `${baseUrl}/functions/v1/mobile-discovery`,
        health: `${baseUrl}/functions/v1/mobile-health`
      },
      syncSettings: {
        uploadOnSync: true,
        autoSync: false,
        syncInterval: 30
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: connectionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na descoberta móvel:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
