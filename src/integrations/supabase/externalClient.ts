import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cliente para o projeto Supabase externo existente do usuário
// Este projeto contém todos os dados originais do sistema
const EXTERNAL_SUPABASE_URL = "https://fvqdehrbgcafyyqmilox.supabase.co";

// IMPORTANTE: Esta é a anon key do projeto externo
// Substitua pela sua chave real se necessário
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cWRlaHJiZ2NhZnl5cW1pbG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTA3MjUsImV4cCI6MjA4MDc4NjcyNX0.fBAzyaA6RVUOCm8fLoZg6QOoKJkNyA2mguNDHvdXVKs";

// Criamos o cliente sem tipagem específica para evitar erros de TypeScript
// já que o banco externo tem seu próprio schema
export const externalSupabase: SupabaseClient<any, 'public', any> = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY
);

// Helper para verificar a conexão com o banco externo
export const testExternalConnection = async () => {
  try {
    const { error } = await externalSupabase.from('products').select('count').limit(1);
    if (error) {
      console.error('❌ External Supabase connection failed:', error);
      return false;
    }
    console.log('✅ External Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Error testing external connection:', error);
    return false;
  }
};
