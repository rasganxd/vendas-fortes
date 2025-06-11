
-- Criar tabela para pedidos mobile
CREATE TABLE public.mobile_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER NOT NULL DEFAULT nextval('orders_code_seq'::regclass),
  customer_id UUID,
  customer_name TEXT,
  customer_code INTEGER,
  sales_rep_id UUID,
  sales_rep_name TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  total NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_method_id UUID,
  payment_table_id UUID,
  payment_table TEXT,
  payments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip TEXT,
  rejection_reason TEXT,
  visit_notes TEXT,
  mobile_order_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  imported_to_orders BOOLEAN DEFAULT false,
  imported_at TIMESTAMP WITH TIME ZONE,
  imported_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para itens dos pedidos mobile
CREATE TABLE public.mobile_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_order_id UUID REFERENCES public.mobile_orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT,
  product_code INTEGER,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC,
  price NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  unit TEXT DEFAULT 'UN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas (opcional, mas recomendado)
ALTER TABLE public.mobile_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_order_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (permitir todas as operações por enquanto)
CREATE POLICY "Allow all operations on mobile_orders" ON public.mobile_orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on mobile_order_items" ON public.mobile_order_items FOR ALL USING (true);

-- Criar índices para melhor performance
CREATE INDEX idx_mobile_orders_sales_rep_id ON public.mobile_orders(sales_rep_id);
CREATE INDEX idx_mobile_orders_customer_id ON public.mobile_orders(customer_id);
CREATE INDEX idx_mobile_orders_sync_status ON public.mobile_orders(sync_status);
CREATE INDEX idx_mobile_orders_imported ON public.mobile_orders(imported_to_orders);
CREATE INDEX idx_mobile_order_items_mobile_order_id ON public.mobile_order_items(mobile_order_id);
