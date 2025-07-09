-- Habilitar RLS em todas as tabelas que não têm
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar causando conflitos
DROP POLICY IF EXISTS "Allow all access to product_brands" ON public.product_brands;
DROP POLICY IF EXISTS "Allow all access to product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow all access to product_groups" ON public.product_groups;
DROP POLICY IF EXISTS "Allow all access to sales_reps" ON public.sales_reps;
DROP POLICY IF EXISTS "Allow all access to units" ON public.units;
DROP POLICY IF EXISTS "Vendedores veem apenas seus clientes" ON public.customers;
DROP POLICY IF EXISTS "Allow all access to customers" ON public.customers;
DROP POLICY IF EXISTS "Todos podem ver produtos" ON public.products;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Vendedores veem seus pedidos confirmados" ON public.orders;
DROP POLICY IF EXISTS "Sistema pode criar pedidos confirmados" ON public.orders;
DROP POLICY IF EXISTS "Sistema pode atualizar pedidos confirmados" ON public.orders;

-- Políticas para tabelas de configuração (acesso público para usuários autenticados)
CREATE POLICY "Authenticated users can view product_brands" ON public.product_brands
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage product_brands" ON public.product_brands
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view product_categories" ON public.product_categories
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage product_categories" ON public.product_categories
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view product_groups" ON public.product_groups
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage product_groups" ON public.product_groups
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view units" ON public.units
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage units" ON public.units
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view products" ON public.products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage products" ON public.products
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view payment_methods" ON public.payment_methods
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage payment_methods" ON public.payment_methods
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view payment_tables" ON public.payment_tables
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage payment_tables" ON public.payment_tables
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para sales_reps (acesso completo para usuários autenticados)
CREATE POLICY "Authenticated users can view sales_reps" ON public.sales_reps
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage sales_reps" ON public.sales_reps
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para customers (usuários veem todos os clientes por enquanto)
CREATE POLICY "Authenticated users can view customers" ON public.customers
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage customers" ON public.customers
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para orders (usuários veem todos os pedidos por enquanto)
CREATE POLICY "Authenticated users can view orders" ON public.orders
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage orders" ON public.orders
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para order_items
CREATE POLICY "Authenticated users can view order_items" ON public.order_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage order_items" ON public.order_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para delivery_routes
CREATE POLICY "Authenticated users can view delivery_routes" ON public.delivery_routes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage delivery_routes" ON public.delivery_routes
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para vehicles
CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage vehicles" ON public.vehicles
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para loads
CREATE POLICY "Authenticated users can view loads" ON public.loads
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage loads" ON public.loads
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para load_items
CREATE POLICY "Authenticated users can view load_items" ON public.load_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage load_items" ON public.load_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para payments
CREATE POLICY "Authenticated users can view payments" ON public.payments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage payments" ON public.payments
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para sales
CREATE POLICY "Authenticated users can view sales" ON public.sales
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage sales" ON public.sales
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para sale_items
CREATE POLICY "Authenticated users can view sale_items" ON public.sale_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage sale_items" ON public.sale_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);