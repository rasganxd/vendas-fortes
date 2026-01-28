-- Drop the restrictive policy
DROP POLICY IF EXISTS "Allow public access to sales_reps" ON public.sales_reps;

-- Create permissive policy for sales_reps
CREATE POLICY "Allow all access to sales_reps"
ON public.sales_reps
FOR ALL
USING (true)
WITH CHECK (true);

-- Create hash_password function for sales rep authentication
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;

-- Create verify_password function for login
CREATE OR REPLACE FUNCTION public.verify_password(password text, password_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$;

-- Create get_next_sales_rep_code function
CREATE OR REPLACE FUNCTION public.get_next_sales_rep_code()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_code integer;
BEGIN
  SELECT COALESCE(MAX(code), 0) + 1 INTO next_code FROM public.sales_reps;
  RETURN next_code;
END;
$$;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;