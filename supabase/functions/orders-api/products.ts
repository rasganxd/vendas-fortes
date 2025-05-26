
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './types.ts';

export async function handleProductsGet(): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Fetching products');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar produtos', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Transform to mobile format
  const formattedProducts = products?.map(product => ({
    id: product.id,
    codigo: product.code,
    nome: product.name,
    descricao: product.description || '',
    preco: product.price,
    custo: product.cost || 0,
    estoque: product.stock || 0,
    estoque_minimo: product.min_stock || 0,
    unidade: product.unit || 'UN',
    grupo_id: product.group_id,
    categoria_id: product.category_id,
    marca_id: product.brand_id
  })) || [];

  console.log(`Returning ${formattedProducts.length} products`);
  
  return new Response(
    JSON.stringify({ 
      products: formattedProducts,
      total: formattedProducts.length 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
