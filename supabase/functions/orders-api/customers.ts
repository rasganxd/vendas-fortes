
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './types.ts';

export async function handleCustomersGet(currentUserId: string): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Fetching customers for sales rep:', currentUserId);
  
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('sales_rep_id', currentUserId)
    .eq('active', true)
    .order('name');

  if (error) {
    console.error('Error fetching customers:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar clientes', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Transform to mobile format
  const formattedCustomers = customers?.map(customer => ({
    id: customer.id,
    codigo: customer.code,
    nome: customer.name,
    razao_social: customer.company_name || '',
    endereco: customer.address || '',
    cidade: customer.city || '',
    estado: customer.state || '',
    cep: customer.zip_code || '',
    telefone: customer.phone || '',
    email: customer.email || '',
    documento: customer.document || '',
    observacoes: customer.notes || '',
    vendedor_id: customer.sales_rep_id,
    dias_visita: customer.visit_days || [],
    frequencia_visita: customer.visit_frequency || '',
    sequencia_visita: customer.visit_sequence || 0
  })) || [];

  console.log(`Returning ${formattedCustomers.length} customers`);
  
  return new Response(
    JSON.stringify({ 
      customers: formattedCustomers,
      total: formattedCustomers.length 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
