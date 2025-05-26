
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function authenticateUser(req: Request): Promise<string | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let currentUserId: string | null = null;
  const authHeader = req.headers.get('authorization');
  const apiKeyHeader = req.headers.get('x-api-key');
  
  if (authHeader?.startsWith('Bearer ')) {
    // JWT Token authentication
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user) {
      currentUserId = user.id;
    }
  } else if (apiKeyHeader) {
    // API Key authentication
    const { data: salesRepId, error } = await supabase.rpc('validate_api_token', {
      token_value: apiKeyHeader
    });
    if (salesRepId) {
      currentUserId = salesRepId;
    }
  }

  return currentUserId;
}
