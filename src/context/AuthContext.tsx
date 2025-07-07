import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
      // Limpar estado anterior
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignorar erros de logout
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return { error };
      }

      if (data.user) {
        console.log('Login bem-sucedido:', data.user.email);
        // Forçar recarga da página para garantir estado limpo
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Erro inesperado no login:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      // Limpar estado anterior
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignorar erros de logout
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || 'Admin'
          }
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        return { error };
      }

      if (data.user) {
        console.log('Cadastro bem-sucedido:', data.user.email);
        // Se não precisa de confirmação de email, fazer login automático
        if (data.user.email_confirmed_at || !data.user.email_confirmed_at) {
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error('Erro inesperado no cadastro:', err);
      return { error: err };
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