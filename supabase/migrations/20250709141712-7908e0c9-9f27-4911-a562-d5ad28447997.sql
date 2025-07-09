-- Corrigir problemas de segurança RLS das funções

-- 1. Recriar função get_next_product_code com search_path seguro
CREATE OR REPLACE FUNCTION public.get_next_product_code()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN nextval('public.products_code_seq');
END;
$function$;

-- 2. Recriar função get_next_order_code com search_path seguro
CREATE OR REPLACE FUNCTION public.get_next_order_code()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN nextval('public.orders_code_seq');
END;
$function$;

-- 3. Recriar função get_next_sales_rep_code com search_path seguro
CREATE OR REPLACE FUNCTION public.get_next_sales_rep_code()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN nextval('public.sales_reps_code_seq');
END;
$function$;

-- 4. Recriar função get_next_customer_code com search_path seguro
CREATE OR REPLACE FUNCTION public.get_next_customer_code()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN nextval('public.customers_code_seq');
END;
$function$;

-- 5. Recriar função get_next_load_code com search_path seguro
CREATE OR REPLACE FUNCTION public.get_next_load_code()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN nextval('public.loads_code_seq');
END;
$function$;

-- 6. Recriar função hash_password com search_path seguro
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Usar bcrypt com custo 10 (padrão seguro)
  RETURN public.crypt(password, public.gen_salt('bf', 10));
END;
$function$;

-- 7. Recriar função verify_password com search_path seguro
CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Verificar se o hash fornecido é válido
  IF hash IS NULL OR hash = '' THEN
    RETURN false;
  END IF;
  
  -- Usar crypt para verificar a senha contra o hash bcrypt
  RETURN public.crypt(password, hash) = hash;
END;
$function$;

-- 8. Recriar função handle_new_admin_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.admin_profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Admin'), NEW.email);
  RETURN NEW;
END;
$function$;

-- 9. Recriar função sync_customers_to_route com search_path seguro
CREATE OR REPLACE FUNCTION public.sync_customers_to_route(p_route_id uuid, p_sales_rep_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Atualizar todos os clientes do vendedor para a rota especificada
  UPDATE public.customers 
  SET delivery_route_id = p_route_id,
      updated_at = now()
  WHERE sales_rep_id = p_sales_rep_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Atualizar timestamp da rota
  UPDATE public.delivery_routes 
  SET last_updated = now()
  WHERE id = p_route_id;
  
  RETURN updated_count;
END;
$function$;

-- 10. Recriar função get_route_with_customers com search_path seguro
CREATE OR REPLACE FUNCTION public.get_route_with_customers(p_route_id uuid)
RETURNS TABLE(route_id uuid, route_name text, route_description text, route_status text, route_date timestamp with time zone, route_sales_rep_id uuid, route_sales_rep_name text, route_vehicle_id uuid, route_vehicle_name text, route_last_updated timestamp with time zone, customer_id uuid, customer_name text, customer_code integer, customer_address text, customer_city text, customer_state text, customer_zip_code text, customer_phone text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    dr.id as route_id,
    dr.name as route_name,
    dr.description as route_description,
    dr.status as route_status,
    dr.date as route_date,
    dr.sales_rep_id as route_sales_rep_id,
    dr.sales_rep_name as route_sales_rep_name,
    dr.vehicle_id as route_vehicle_id,
    dr.vehicle_name as route_vehicle_name,
    dr.last_updated as route_last_updated,
    c.id as customer_id,
    c.name as customer_name,
    c.code as customer_code,
    c.address as customer_address,
    c.city as customer_city,
    c.state as customer_state,
    c.zip_code as customer_zip_code,
    c.phone as customer_phone
  FROM public.delivery_routes dr
  LEFT JOIN public.customers c ON c.delivery_route_id = dr.id
  WHERE dr.id = p_route_id
  ORDER BY c.name;
END;
$function$;