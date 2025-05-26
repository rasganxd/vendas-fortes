
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SalesRep } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface SalesRepCredentials {
  email: string;
  password: string;
}

interface SalesRepSession {
  salesRep: SalesRep | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useSalesRepAuth = () => {
  const [session, setSession] = useState<SalesRepSession>({
    salesRep: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadSalesRepData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setSession({
            salesRep: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadSalesRepData(session.user.id);
      } else {
        setSession(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setSession({
        salesRep: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const loadSalesRepData = async (userId: string) => {
    try {
      const { data: salesRep, error } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setSession({
        salesRep,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading sales rep data:', error);
      setSession({
        salesRep: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (credentials: SalesRepCredentials) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;

      if (data.user) {
        await loadSalesRepData(data.user.id);
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema!"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setSession({
        salesRep: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession({
        salesRep: null,
        isAuthenticated: false,
        isLoading: false
      });

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema."
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Erro ao desconectar",
        variant: "destructive"
      });
    }
  };

  const createSalesRepAccount = async (salesRep: SalesRep, password: string) => {
    try {
      if (!salesRep.email) {
        throw new Error('Email é obrigatório para criar conta');
      }

      const { data, error } = await supabase.auth.signUp({
        email: salesRep.email,
        password: password,
        options: {
          data: {
            sales_rep_id: salesRep.id,
            name: salesRep.name
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso",
        description: `Conta criada para ${salesRep.name}`
      });

      return data;
    } catch (error) {
      console.error('Error creating sales rep account:', error);
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    ...session,
    login,
    logout,
    createSalesRepAccount,
    refreshSession: checkSession
  };
};
