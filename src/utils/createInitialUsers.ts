
import { supabase } from '@/integrations/supabase/client';

interface CreateUserData {
  email: string;
  password: string;
  role: 'admin' | 'vendedor';
  name: string;
}

export const createInitialUsers = async () => {
  const users: CreateUserData[] = [
    {
      email: 'vendedor@empresa.com',
      password: '123456',
      role: 'vendedor',
      name: 'Vendedor Sistema'
    },
    {
      email: 'adm@empresa.com', 
      password: '123456',
      role: 'admin',
      name: 'Administrador Sistema'
    }
  ];

  const results = [];

  for (const userData of users) {
    try {
      console.log(`Creating user: ${userData.email}`);
      
      // Criar usuário com Supabase Auth Admin
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name
        }
      });

      if (authError) {
        console.error(`Error creating user ${userData.email}:`, authError);
        results.push({ email: userData.email, success: false, error: authError.message });
        continue;
      }

      if (authData.user) {
        // Aguardar um pouco para o trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Atualizar o perfil com o papel correto
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            role: userData.role,
            name: userData.name 
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error(`Error updating profile for ${userData.email}:`, profileError);
          results.push({ email: userData.email, success: false, error: profileError.message });
        } else {
          console.log(`Successfully created user: ${userData.email}`);
          results.push({ email: userData.email, success: true });
        }
      }
    } catch (error) {
      console.error(`Unexpected error creating user ${userData.email}:`, error);
      results.push({ email: userData.email, success: false, error: 'Erro inesperado' });
    }
  }

  return results;
};
