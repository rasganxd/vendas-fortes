-- ===========================================
-- MIGRATION: Create all tables from external Supabase project
-- ===========================================

-- UNITS TABLE
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  description TEXT,
  package_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to units" ON public.units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to units" ON public.units FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to units" ON public.units FOR DELETE USING (true);

-- PRODUCT GROUPS TABLE
CREATE TABLE public.product_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to product_groups" ON public.product_groups FOR ALL USING (true) WITH CHECK (true);

-- PRODUCT CATEGORIES TABLE
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to product_categories" ON public.product_categories FOR ALL USING (true) WITH CHECK (true);

-- PRODUCT BRANDS TABLE
CREATE TABLE public.product_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to product_brands" ON public.product_brands FOR ALL USING (true) WITH CHECK (true);

-- PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  sale_price NUMERIC(12,2),
  cost NUMERIC(12,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_discount_percent NUMERIC(5,2) DEFAULT 0,
  max_price NUMERIC(12,2),
  group_id UUID REFERENCES public.product_groups(id),
  category_id UUID REFERENCES public.product_categories(id),
  brand_id UUID REFERENCES public.product_brands(id),
  unit TEXT,
  subunit TEXT,
  has_subunit BOOLEAN DEFAULT false,
  subunit_ratio NUMERIC(12,4),
  main_unit_id UUID REFERENCES public.units(id),
  sub_unit_id UUID REFERENCES public.units(id),
  active BOOLEAN DEFAULT true,
  sync_status TEXT DEFAULT 'synced',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- SALES REPS TABLE
CREATE TABLE public.sales_reps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  password TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to sales_reps" ON public.sales_reps FOR ALL USING (true) WITH CHECK (true);

-- VEHICLES TABLE
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'car',
  license_plate TEXT,
  plate_number TEXT,
  model TEXT,
  brand TEXT,
  year INTEGER,
  capacity INTEGER,
  active BOOLEAN DEFAULT true,
  status TEXT,
  notes TEXT,
  driver_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

-- DELIVERY ROUTES TABLE
CREATE TABLE public.delivery_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  date TIMESTAMP WITH TIME ZONE,
  driver_id UUID,
  driver_name TEXT,
  vehicle_id UUID REFERENCES public.vehicles(id),
  vehicle_name TEXT,
  sales_rep_id UUID REFERENCES public.sales_reps(id),
  sales_rep_name TEXT,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to delivery_routes" ON public.delivery_routes FOR ALL USING (true) WITH CHECK (true);

-- CUSTOMERS TABLE
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  document TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  visit_days TEXT[],
  visit_frequency TEXT,
  visit_sequence INTEGER,
  visit_sequences JSONB,
  sales_rep_id UUID REFERENCES public.sales_reps(id),
  sales_rep_name TEXT,
  delivery_route_id UUID REFERENCES public.delivery_routes(id),
  active BOOLEAN DEFAULT true,
  sync_pending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- PAYMENT METHODS TABLE
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  type TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to payment_methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);

-- PAYMENT TABLES TABLE
CREATE TABLE public.payment_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  type TEXT,
  installments JSONB,
  terms JSONB,
  payable_to TEXT,
  payment_location TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to payment_tables" ON public.payment_tables FOR ALL USING (true) WITH CHECK (true);

-- ORDERS TABLE
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  customer_code INTEGER,
  sales_rep_id UUID REFERENCES public.sales_reps(id),
  sales_rep_name TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  total NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_table_id UUID REFERENCES public.payment_tables(id),
  payment_table TEXT,
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip TEXT,
  import_status TEXT DEFAULT 'pending',
  imported_at TIMESTAMP WITH TIME ZONE,
  imported_by TEXT,
  source_project TEXT,
  mobile_order_id TEXT,
  rejection_reason TEXT,
  visit_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- ORDER ITEMS TABLE
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  product_code INTEGER,
  quantity NUMERIC(12,4) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  price NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  amount NUMERIC(12,2) DEFAULT 0,
  method TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  amount_in_words TEXT,
  payment_location TEXT,
  emission_location TEXT,
  customer_name TEXT,
  customer_document TEXT,
  customer_address TEXT,
  installments JSONB,
  payment_date TIMESTAMP WITH TIME ZONE,
  sales_rep_id UUID REFERENCES public.sales_reps(id),
  synced_to_mobile BOOLEAN DEFAULT false,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- LOADS TABLE
CREATE TABLE public.loads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code INTEGER,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  vehicle_id UUID REFERENCES public.vehicles(id),
  vehicle_name TEXT,
  driver_id UUID,
  driver_name TEXT,
  sales_rep_id UUID REFERENCES public.sales_reps(id),
  sales_rep_name TEXT,
  route_id UUID REFERENCES public.delivery_routes(id),
  route_name TEXT,
  status TEXT DEFAULT 'pending',
  departure_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  return_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  order_ids JSONB,
  total NUMERIC(12,2) DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to loads" ON public.loads FOR ALL USING (true) WITH CHECK (true);

-- LOAD ITEMS TABLE
CREATE TABLE public.load_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  load_id UUID REFERENCES public.loads(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  product_code INTEGER,
  quantity NUMERIC(12,4) DEFAULT 0,
  price NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  order_id UUID REFERENCES public.orders(id),
  order_item_id UUID,
  customer_id UUID REFERENCES public.customers(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.load_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to load_items" ON public.load_items FOR ALL USING (true) WITH CHECK (true);

-- ROUTE STOPS TABLE
CREATE TABLE public.route_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.delivery_routes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  sequence INTEGER,
  position INTEGER,
  status TEXT DEFAULT 'pending',
  completed BOOLEAN DEFAULT false,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to route_stops" ON public.route_stops FOR ALL USING (true) WITH CHECK (true);

-- IMPORT REPORTS TABLE
CREATE TABLE public.import_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  operation_type TEXT,
  operator TEXT,
  orders_count INTEGER DEFAULT 0,
  total_value NUMERIC(12,2) DEFAULT 0,
  sales_reps_count INTEGER DEFAULT 0,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.import_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to import_reports" ON public.import_reports FOR ALL USING (true) WITH CHECK (true);

-- MOBILE ORDER IMPORT TABLE
CREATE TABLE public.mobile_order_import (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_data JSONB,
  sales_rep_id UUID,
  sales_rep_name TEXT,
  status TEXT DEFAULT 'pending',
  imported_at TIMESTAMP WITH TIME ZONE,
  imported_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.mobile_order_import ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to mobile_order_import" ON public.mobile_order_import FOR ALL USING (true) WITH CHECK (true);

-- COMPANY SETTINGS TABLE
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  document TEXT,
  footer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);

-- APP SETTINGS TABLE
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- ADMIN PROFILES TABLE
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to admin_profiles" ON public.admin_profiles FOR ALL USING (true) WITH CHECK (true);

-- SYSTEM BACKUPS TABLE
CREATE TABLE public.system_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  backup_data JSONB,
  type TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'completed',
  size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to system_backups" ON public.system_backups FOR ALL USING (true) WITH CHECK (true);

-- MAINTENANCE LOGS TABLE
CREATE TABLE public.maintenance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation TEXT,
  details JSONB,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to maintenance_logs" ON public.maintenance_logs FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_groups_updated_at BEFORE UPDATE ON public.product_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_brands_updated_at BEFORE UPDATE ON public.product_brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_reps_updated_at BEFORE UPDATE ON public.sales_reps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON public.delivery_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_tables_updated_at BEFORE UPDATE ON public.payment_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loads_updated_at BEFORE UPDATE ON public.loads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_load_items_updated_at BEFORE UPDATE ON public.load_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_route_stops_updated_at BEFORE UPDATE ON public.route_stops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mobile_order_import_updated_at BEFORE UPDATE ON public.mobile_order_import FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();