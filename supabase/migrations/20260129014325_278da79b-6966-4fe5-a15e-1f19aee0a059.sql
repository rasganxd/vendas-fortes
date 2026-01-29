-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate the hash_password function with explicit schema reference
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN extensions.crypt(password, extensions.gen_salt('bf'));
END;
$$;

-- Recreate the verify_password function with explicit schema reference
CREATE OR REPLACE FUNCTION public.verify_password(password text, password_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN password_hash = extensions.crypt(password, password_hash);
END;
$$;