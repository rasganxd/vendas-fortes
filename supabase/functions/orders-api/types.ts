
export interface OrderItem {
  produto: string;
  quantidade: number;
  preco_unitario: number;
}

export interface Order {
  cliente: string;
  data?: string;
  status?: string;
  itens: OrderItem[];
  valor_total: number;
  vendedor_id: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};
