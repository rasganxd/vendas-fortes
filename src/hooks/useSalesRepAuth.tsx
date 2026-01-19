
import { useState } from 'react';
import { SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { salesRepAuthService } from '@/services/local/salesRepAuthService';

interface LoginResponse {
  success: boolean;
  salesRep?: Omit<SalesRep, 'password'>;
  sessionToken?: string;
  error?: string;
  message?: string;
}

export const useSalesRepAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Authenticate sales rep using code and password
   * Tries Supabase first, falls back to local storage if offline
   */
  const authenticate = async (code: number, password: string): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      console.log(`🔐 [useSalesRepAuth] Authenticating sales rep with code: ${code}`);

      // Validate inputs
      if (!code || !password) {
        return {
          success: false,
          error: 'Código e senha são obrigatórios'
        };
      }

      // Try Supabase Edge Function first
      try {
        console.log('🌐 [useSalesRepAuth] Trying Supabase authentication...');
        
        const { data, error } = await supabase.functions.invoke('sales-rep-login', {
          body: { code, password }
        });

        if (error) {
          console.error('❌ [useSalesRepAuth] Supabase function error:', error);
          throw error;
        }

        console.log('📋 [useSalesRepAuth] Supabase response:', { success: data?.success, hasToken: !!data?.sessionToken });

        if (data?.success) {
          console.log('✅ [useSalesRepAuth] Supabase authentication successful for:', data.salesRep?.name);
          
          // Store session data for mobile sync
          if (data.sessionToken) {
            localStorage.setItem('mobile_session_token', data.sessionToken);
            localStorage.setItem('mobile_session_expires', data.expiresAt);
            localStorage.setItem('current_sales_rep', JSON.stringify(data.salesRep));
            console.log('💾 [useSalesRepAuth] Session data stored locally');
          }
          
          return {
            success: true,
            salesRep: data.salesRep,
            sessionToken: data.sessionToken,
            message: data.message || `Bem-vindo, ${data.salesRep?.name}!`
          };
        } else {
          console.log('❌ [useSalesRepAuth] Supabase authentication failed:', data?.error);
          return {
            success: false,
            error: data?.error || 'Erro de autenticação'
          };
        }

      } catch (supabaseError) {
        console.log('❌ [useSalesRepAuth] Supabase authentication failed, trying local fallback:', supabaseError);
        
        // Fallback to local authentication
        console.log('💾 [useSalesRepAuth] Trying local authentication...');
        const localResult = await salesRepAuthService.authenticate(code, password);
        
        if (localResult.success) {
          console.log('✅ [useSalesRepAuth] Local authentication successful for:', localResult.salesRep?.name);
          // Store local session
          localStorage.setItem('current_sales_rep', JSON.stringify(localResult.salesRep));
          return {
            ...localResult,
            message: `Bem-vindo, ${localResult.salesRep?.name}! (Modo offline)`
          };
        } else {
          console.log('❌ [useSalesRepAuth] Local authentication failed:', localResult.error);
          return localResult;
        }
      }

    } catch (error) {
      console.error('❌ [useSalesRepAuth] Critical error during authentication:', error);
      return {
        success: false,
        error: 'Erro interno durante autenticação. Verifique sua conexão e tente novamente.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get sales rep by code (without authentication)
   */
  const getSalesRepByCode = async (code: number): Promise<SalesRep | null> => {
    try {
      // Try Supabase first
      try {
        const { data, error } = await supabase.functions.invoke('mobile-data-sync', {
          body: { action: 'get_sales_rep', salesRepCode: code }
        });

        if (data?.success && data.salesRep) {
          return data.salesRep;
        }
      } catch (supabaseError) {
        console.log('Supabase unavailable, trying local service');
      }

      // Fallback to local service
      return await salesRepAuthService.getSalesRepByCode(code);
    } catch (error) {
      console.error('Error getting sales rep by code:', error);
      return null;
    }
  };

  /**
   * Check if current session is valid
   */
  const isSessionValid = (): boolean => {
    const token = localStorage.getItem('mobile_session_token');
    const expires = localStorage.getItem('mobile_session_expires');
    
    if (!token || !expires) {
      return false;
    }
    
    return new Date(expires) > new Date();
  };

  /**
   * Get current authenticated sales rep
   */
  const getCurrentSalesRep = (): SalesRep | null => {
    try {
      const stored = localStorage.getItem('current_sales_rep');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  /**
   * Logout and clear session
   */
  const logout = () => {
    localStorage.removeItem('mobile_session_token');
    localStorage.removeItem('mobile_session_expires');
    localStorage.removeItem('current_sales_rep');
  };

  return {
    authenticate,
    getSalesRepByCode,
    isSessionValid,
    getCurrentSalesRep,
    logout,
    isLoading
  };
};
