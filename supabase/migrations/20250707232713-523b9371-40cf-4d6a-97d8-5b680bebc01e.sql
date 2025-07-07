-- Verificar se a função handle_new_admin_user existe e recriar se necessário
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Admin'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger para garantir que funcione
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();