
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './types.ts';
import { authenticateUser } from './auth.ts';
import { handleCustomersGet } from './customers.ts';
import { handleProductsGet } from './products.ts';
import { 
  handleOrdersPost, 
  handleOrdersGet, 
  handleOrderById, 
  handleOrderUpdate, 
  handleOrderDelete 
} from './orders.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/orders-api', '');
    const method = req.method;

    // Extract authentication
    const currentUserId = await authenticateUser(req);

    if (!currentUserId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Route handling
    if (method === 'GET' && path === '/customers') {
      return await handleCustomersGet(currentUserId);
    }

    if (method === 'GET' && path === '/products') {
      return await handleProductsGet();
    }

    if (method === 'POST' && path === '/') {
      return await handleOrdersPost(req, currentUserId);
    }

    if (method === 'GET' && path === '/') {
      return await handleOrdersGet(url);
    }

    if (method === 'GET' && path.startsWith('/')) {
      const orderId = path.substring(1);
      return await handleOrderById(orderId);
    }

    if ((method === 'PUT' || method === 'PATCH') && path.startsWith('/')) {
      const orderId = path.substring(1);
      return await handleOrderUpdate(req, orderId);
    }

    if (method === 'DELETE' && path.startsWith('/')) {
      const orderId = path.substring(1);
      return await handleOrderDelete(orderId);
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Endpoint não encontrado' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
