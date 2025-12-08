import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { externalSupabase as supabase } from '@/integrations/supabase/externalClient';

// Função para limpar estado de autenticação
const cleanupAuthState = () => {
  // Remove todos os tokens Supabase do localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove do sessionStorage se existir
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

interface AdminProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando processo de login para:', email);
      
      // Testar conectividade com Supabase primeiro
      try {
        console.log('🔗 Testando conectividade com Supabase...');
        const { data: testData, error: testError } = await supabase.from('admin_profiles').select('count', { count: 'exact', head: true });
        console.log('✅ Teste de conectividade:', { testData, testError });
      } catch (testErr) {
        console.error('❌ Falha na conectividade com Supabase:', testErr);
        return { error: { message: 'Erro de conectividade com o servidor. Verifique sua conexão.' } };
      }
      
      // Limpar estado anterior
      console.log('🧹 Limpando estado de autenticação anterior...');
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('🚪 Sessão anterior encerrada');
      } catch (err) {
        console.log('ℹ️ Nenhuma sessão anterior para encerrar:', err);
      }

      console.log('📝 Tentando fazer login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        // Mensagens de erro mais específicas
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Email ou senha incorretos.' } };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Confirme seu email antes de fazer login.' } };
        }
        if (error.message.includes('Too many requests')) {
          return { error: { message: 'Muitas tentativas. Aguarde alguns minutos.' } };
        }
        return { error: { message: error.message || 'Erro no login. Tente novamente.' } };
      }

      console.log('✅ Login bem-sucedido:', { user: data.user?.id, session: !!data.session });

      if (data.user) {
        // Buscar perfil do usuário
        try {
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          console.log('👤 Perfil do usuário carregado:', profile);
        } catch (profileErr) {
          console.warn('⚠️ Não foi possível carregar o perfil do usuário:', profileErr);
        }
        
        console.log('🚀 Redirecionando para dashboard...');
        // Forçar recarga da página para garantir estado limpo
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }

      return { error: null };
    } catch (err: any) {
      console.error('💥 Erro inesperado no login:', err);
      return { 
        error: { 
          message: err.message || 'Erro interno. Tente novamente em alguns momentos.' 
        } 
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('🚀 Iniciando processo de cadastro para:', email);
      
      // Testar conectividade com Supabase primeiro
      try {
        console.log('🔗 Testando conectividade com Supabase...');
        const { data: testData, error: testError } = await supabase.from('admin_profiles').select('count', { count: 'exact', head: true });
        console.log('✅ Teste de conectividade:', { testData, testError });
      } catch (testErr) {
        console.error('❌ Falha na conectividade com Supabase:', testErr);
        return { error: { message: 'Erro de conectividade com o servidor. Verifique sua conexão.' } };
      }
      
      // Limpar estado anterior
      console.log('🧹 Limpando estado de autenticação anterior...');
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('🚪 Sessão anterior encerrada');
      } catch (err) {
        console.log('ℹ️ Nenhuma sessão anterior para encerrar:', err);
      }

      const redirectUrl = `${window.location.origin}/`;
      console.log('🔗 URL de redirecionamento:', redirectUrl);
      
      const signUpData = {
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || 'Admin'
          }
        }
      };
      
      console.log('📝 Dados de cadastro preparados:', { email, hasPassword: !!password, hasName: !!name });
      
      const { data, error } = await supabase.auth.signUp(signUpData);

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        // Mensagens de erro mais específicas
        if (error.message.includes('User already registered')) {
          return { error: { message: 'Este email já está cadastrado. Tente fazer login.' } };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: { message: 'Senha deve ter pelo menos 6 caracteres.' } };
        }
        if (error.message.includes('Unable to validate email address')) {
          return { error: { message: 'Email inválido.' } };
        }
        if (error.message.includes('Signup is disabled')) {
          return { error: { message: 'Cadastro temporariamente desabilitado.' } };
        }
        return { error: { message: error.message || 'Erro no cadastro. Tente novamente.' } };
      }

      console.log('✅ Cadastro bem-sucedido:', { user: data.user?.id, session: !!data.session });

      if (data.user) {
        console.log('👤 Usuário criado com sucesso:', data.user.id);
        console.log('📧 Status de confirmação de email:', data.user.email_confirmed_at ? 'Confirmado' : 'Pendente');
        
        // Aguardar um momento para o trigger criar o perfil
        console.log('⏳ Aguardando criação do perfil...');
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('admin_profiles')
              .select('*')
              .eq('user_id', data.user!.id)
              .single();
            console.log('📋 Perfil criado pelo trigger:', profile);
          } catch (profileErr) {
            console.warn('⚠️ Perfil não encontrado após cadastro:', profileErr);
          }
        }, 1000);
        
        console.log('🚀 Redirecionando para dashboard...');
        // Redirecionar independentemente da confirmação de email
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }

      return { error: null };
    } catch (err: any) {
      console.error('💥 Erro inesperado no cadastro:', err);
      return { 
        error: { 
          message: err.message || 'Erro interno. Tente novamente em alguns momentos.' 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      // Limpar estado antes do logout
      cleanupAuthState();
      
      // Tentar logout global
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Erro no logout:', err);
      }
      
      // Limpar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Forçar recarga para garantir limpeza completa
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo em caso de erro, limpar estado local e redirecionar
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};