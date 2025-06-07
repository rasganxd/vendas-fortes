
export function validateSalesRepCode(salesRepCode: number | undefined, action: string): string | null {
  if (action !== 'get_sales_rep' && !salesRepCode) {
    return 'Sales rep code is required';
  }
  return null;
}

export async function getSalesRepById(supabase: any, salesRepCode: number) {
  const { data: rep, error: repError } = await supabase
    .from('sales_reps')
    .select('id, name')
    .eq('code', salesRepCode)
    .eq('active', true)
    .single();

  if (repError || !rep) {
    console.log(`❌ [mobile-data-sync] Sales rep not found for code: ${salesRepCode}`, repError);
    return null;
  }

  console.log(`✅ [mobile-data-sync] Found sales rep: ${rep.name} (ID: ${rep.id})`);
  return rep;
}
