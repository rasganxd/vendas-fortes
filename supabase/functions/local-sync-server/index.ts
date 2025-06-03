
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    console.log(`🔄 [LocalSyncServer] ${method} ${path}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Health check endpoint
    if (path === '/health') {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          server: 'local-sync-server'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Validate sales rep endpoint
    if (path === '/validar-vendedor' && method === 'POST') {
      const { codigo } = await req.json()
      
      console.log(`🔍 [LocalSyncServer] Validando vendedor: ${codigo}`)

      const { data: vendedor, error } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('code', codigo)
        .eq('active', true)
        .single()

      if (error || !vendedor) {
        console.log(`❌ [LocalSyncServer] Vendedor ${codigo} não encontrado`)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Vendedor não encontrado' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        )
      }

      console.log(`✅ [LocalSyncServer] Vendedor ${vendedor.name} validado`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          vendedor: {
            id: vendedor.id,
            codigo: vendedor.code,
            nome: vendedor.name
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // First sync endpoint - generate sales rep data
    if (path.startsWith('/primeira-atualizacao/') && method === 'GET') {
      const codigo = parseInt(path.split('/')[2])
      
      console.log(`📦 [LocalSyncServer] Gerando dados para vendedor: ${codigo}`)

      // Validate sales rep
      const { data: vendedor, error: vendedorError } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('code', codigo)
        .eq('active', true)
        .single()

      if (vendedorError || !vendedor) {
        console.log(`❌ [LocalSyncServer] Vendedor ${codigo} não encontrado`)
        return new Response(
          JSON.stringify({ 
            error: 'Vendedor não encontrado',
            codigo: codigo 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        )
      }

      // Fetch products
      const { data: produtos, error: produtosError } = await supabase
        .from('products')
        .select(`
          *,
          main_unit:units!products_main_unit_id_fkey(code, description),
          sub_unit:units!products_sub_unit_id_fkey(code, description)
        `)
        .eq('active', true)
        .order('code')

      if (produtosError) {
        console.error('❌ [LocalSyncServer] Erro ao buscar produtos:', produtosError)
        throw produtosError
      }

      // Fetch customers for this sales rep
      const { data: clientes, error: clientesError } = await supabase
        .from('customers')
        .select('*')
        .eq('sales_rep_id', vendedor.id)
        .eq('active', true)
        .order('name')

      if (clientesError) {
        console.error('❌ [LocalSyncServer] Erro ao buscar clientes:', clientesError)
        throw clientesError
      }

      // Fetch delivery routes for this sales rep
      const { data: rotas, error: rotasError } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('sales_rep_id', vendedor.id)
        .eq('active', true)
        .order('name')

      if (rotasError) {
        console.error('❌ [LocalSyncServer] Erro ao buscar rotas:', rotasError)
        throw rotasError
      }

      // Fetch payment tables
      const { data: tabelasPreco, error: tabelasError } = await supabase
        .from('payment_tables')
        .select('*')
        .eq('active', true)
        .order('name')

      if (tabelasError) {
        console.error('❌ [LocalSyncServer] Erro ao buscar tabelas de preço:', tabelasError)
        throw tabelasError
      }

      // Fetch app settings
      const { data: configuracoes, error: configError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single()

      if (configError) {
        console.warn('⚠️ [LocalSyncServer] Configurações não encontradas:', configError)
      }

      // Transform products
      const produtosTransformados = (produtos || []).map(item => ({
        id: item.id,
        codigo: item.code,
        nome: item.name,
        descricao: '',
        custo: item.cost_price || 0,
        preco: item.sale_price || 0,
        estoque: item.stock || 0,
        desconto_maximo_percent: item.max_discount_percent || 0,
        unidade: item.main_unit?.code || 'UN',
        sub_unidade: item.sub_unit?.code || null,
        categoria_id: item.category_id,
        grupo_id: item.group_id,
        marca_id: item.brand_id,
        ativo: item.active,
        criado_em: item.created_at,
        atualizado_em: item.updated_at
      }))

      // Transform customers
      const clientesTransformados = (clientes || []).map(item => ({
        id: item.id,
        codigo: item.code,
        nome: item.name,
        nome_empresa: item.company_name || '',
        telefone: item.phone || '',
        email: item.email || '',
        endereco: item.address || '',
        cidade: item.city || '',
        estado: item.state || '',
        cep: item.zip_code || '',
        documento: item.document || '',
        observacoes: item.notes || '',
        dias_visita: item.visit_days || [],
        frequencia_visita: item.visit_frequency || '',
        sequencia_visita: item.visit_sequence || 0,
        vendedor_id: item.sales_rep_id,
        rota_entrega_id: item.delivery_route_id,
        ativo: item.active,
        criado_em: item.created_at,
        atualizado_em: item.updated_at
      }))

      const dadosVendedor = {
        vendedor: {
          id: vendedor.id,
          codigo: vendedor.code,
          nome: vendedor.name,
          email: vendedor.email || '',
          senha: vendedor.password || '' // Para login local no mobile
        },
        produtos: produtosTransformados,
        clientes: clientesTransformados,
        rotas: rotas || [],
        tabelas_preco: tabelasPreco || [],
        configuracoes: configuracoes || {},
        timestamp: new Date().toISOString(),
        versao: '1.0.0'
      }

      // Log sync event
      const { error: logError } = await supabase
        .from('sync_logs')
        .insert({
          sales_rep_id: vendedor.id,
          event_type: 'download',
          data_type: 'primeira_sincronizacao',
          records_count: produtosTransformados.length + clientesTransformados.length,
          status: 'completed',
          metadata: {
            produtos_count: produtosTransformados.length,
            clientes_count: clientesTransformados.length,
            rotas_count: (rotas || []).length,
            tabelas_count: (tabelasPreco || []).length,
            endpoint: 'primeira-atualizacao'
          }
        })

      if (logError) {
        console.error('⚠️ [LocalSyncServer] Erro ao registrar log:', logError)
      }

      console.log(`✅ [LocalSyncServer] Dados gerados: ${produtosTransformados.length} produtos, ${clientesTransformados.length} clientes`)

      return new Response(
        JSON.stringify(dadosVendedor),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Receive mobile orders endpoint
    if (path.startsWith('/vendedor/') && path.endsWith('/pedidos') && method === 'POST') {
      const pathParts = path.split('/')
      const codigo = parseInt(pathParts[2])
      
      console.log(`📥 [LocalSyncServer] Recebendo pedidos do vendedor: ${codigo}`)

      const { pedidos } = await req.json()

      if (!Array.isArray(pedidos)) {
        return new Response(
          JSON.stringify({ 
            error: 'Formato inválido: esperado array de pedidos' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      let sucessos = 0
      let falhas = 0
      const erros: string[] = []

      for (const pedido of pedidos) {
        try {
          // Insert order into orders_mobile table
          const { error: orderError } = await supabase
            .from('orders_mobile')
            .insert({
              code: pedido.codigo,
              customer_id: pedido.cliente_id,
              customer_name: pedido.cliente_nome,
              sales_rep_id: pedido.vendedor_id,
              sales_rep_name: pedido.vendedor_nome,
              date: pedido.data,
              total: pedido.total,
              status: 'pending',
              payment_status: 'pending',
              payment_method: pedido.pagamento?.metodo || null,
              payment_table: pedido.pagamento?.tabela || null,
              source_project: 'mobile',
              imported: false
            })

          if (orderError) {
            console.error('❌ [LocalSyncServer] Erro ao inserir pedido:', orderError)
            erros.push(`Pedido ${pedido.codigo}: ${orderError.message}`)
            falhas++
            continue
          }

          // Insert order items
          if (pedido.itens && Array.isArray(pedido.itens)) {
            for (const item of pedido.itens) {
              const { error: itemError } = await supabase
                .from('order_items_mobile')
                .insert({
                  order_id: pedido.id || null, // This might need to be handled differently
                  product_code: item.produto_codigo,
                  product_name: item.produto_nome,
                  quantity: item.quantidade,
                  unit_price: item.preco_unitario,
                  price: item.preco_unitario,
                  total: item.total
                })

              if (itemError) {
                console.error('❌ [LocalSyncServer] Erro ao inserir item:', itemError)
              }
            }
          }

          sucessos++
        } catch (error) {
          console.error('❌ [LocalSyncServer] Erro ao processar pedido:', error)
          erros.push(`Pedido ${pedido.codigo}: ${error.message}`)
          falhas++
        }
      }

      // Log sync event
      const { error: logError } = await supabase
        .from('sync_logs')
        .insert({
          sales_rep_id: null, // We'd need to fetch this based on codigo
          event_type: 'upload',
          data_type: 'pedidos_mobile',
          records_count: sucessos,
          status: falhas > 0 ? 'partial' : 'completed',
          metadata: {
            sucessos,
            falhas,
            total_pedidos: pedidos.length,
            endpoint: 'receber-pedidos'
          }
        })

      if (logError) {
        console.error('⚠️ [LocalSyncServer] Erro ao registrar log:', logError)
      }

      console.log(`✅ [LocalSyncServer] Pedidos processados: ${sucessos} sucessos, ${falhas} falhas`)

      return new Response(
        JSON.stringify({
          sucessos,
          falhas,
          erros,
          total: pedidos.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ 
        error: 'Endpoint não encontrado',
        path: path,
        method: method 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    )

  } catch (error) {
    console.error('❌ [LocalSyncServer] Erro interno:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
