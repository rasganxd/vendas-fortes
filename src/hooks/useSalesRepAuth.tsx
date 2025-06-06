
import { useState } from 'react';
import { SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { salesRepAuthService } from '@/services/local/salesRepAuthService';

interface LoginResponse {
  success: boolean;
  salesRep?: Omit<SalesRep, 'password'>;
  error?: string;
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
      console.log(`🔐 Authenticating sales rep with code: ${code}`);

      // Try Supabase Edge Function first
      try {
        console.log('🌐 Trying Supabase authentication...');
        
        const { data, error } = await supabase.functions.invoke('sales-rep-login', {
          body: { code, password }
        });

        if (error) {
          console.error('❌ Supabase function error:', error);
          throw error;
        }

        if (data?.success) {
          console.log('✅ Supabase authentication successful');
          return {
            success: true,
            salesRep: data.salesRep
          };
        } else {
          return {
            success: false,
            error: data?.error || 'Erro de autenticação'
          };
        }

      } catch (supabaseError) {
        console.log('❌ Supabase authentication failed, trying local fallback:', supabaseError);
        
        // Fallback to local authentication
        console.log('💾 Trying local authentication...');
        const localResult = await salesRepAuthService.authenticate(code, password);
        
        if (localResult.success) {
          console.log('✅ Local authentication successful');
        } else {
          console.log('❌ Local authentication failed:', localResult.error);
        }
        
        return localResult;
      }

    } catch (error) {
      console.error('❌ Critical error during authentication:', error);
      return {
        success: false,
        error: 'Erro interno durante autenticação'
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
      // Try local service first for better performance
      return await salesRepAuthService.getSalesRepByCode(code);
    } catch (error) {
      console.error('Error getting sales rep by code:', error);
      return null;
    }
  };

  return {
    authenticate,
    getSalesRepByCode,
    isLoading
  };
};
