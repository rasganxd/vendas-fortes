
import { supabase } from '@/integrations/supabase/client';
import { SalesRep } from '@/types';

interface MobileAuthResponse {
  salesRep: SalesRep | null;
  session: any;
  error?: string;
}

class MobileAuthService {
  /**
   * Authenticate sales rep with email and password
   */
  async login(email: string, password: string): Promise<MobileAuthResponse> {
    try {
      console.log('🔐 Attempting mobile login for:', email);
      
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('❌ Authentication error:', authError);
        return {
          salesRep: null,
          session: null,
          error: authError.message
        };
      }
      
      if (!authData.user || !authData.session) {
        return {
          salesRep: null,
          session: null,
          error: 'Invalid authentication response'
        };
      }
      
      // Get sales rep data using the authenticated user ID
      const { data: salesRepData, error: salesRepError } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (salesRepError) {
        console.error('❌ Sales rep fetch error:', salesRepError);
        return {
          salesRep: null,
          session: authData.session,
          error: 'Sales rep not found'
        };
      }
      
      // Transform to SalesRep interface
      const salesRep: SalesRep = {
        id: salesRepData.id,
        code: salesRepData.code,
        name: salesRepData.name,
        phone: salesRepData.phone || '',
        email: salesRepData.email || '',
        active: salesRepData.active,
        createdAt: new Date(salesRepData.created_at),
        updatedAt: new Date(salesRepData.updated_at)
      };
      
      console.log('✅ Mobile login successful for:', salesRep.name);
      
      return {
        salesRep,
        session: authData.session,
        error: undefined
      };
      
    } catch (error) {
      console.error('❌ Mobile login error:', error);
      return {
        salesRep: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get current session and user
   */
  async getCurrentSession(): Promise<MobileAuthResponse> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return {
          salesRep: null,
          session: null,
          error: error?.message || 'No active session'
        };
      }
      
      // Get sales rep data
      const { data: salesRepData, error: salesRepError } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (salesRepError) {
        return {
          salesRep: null,
          session,
          error: 'Sales rep not found'
        };
      }
      
      const salesRep: SalesRep = {
        id: salesRepData.id,
        code: salesRepData.code,
        name: salesRepData.name,
        phone: salesRepData.phone || '',
        email: salesRepData.email || '',
        active: salesRepData.active,
        createdAt: new Date(salesRepData.created_at),
        updatedAt: new Date(salesRepData.updated_at)
      };
      
      return {
        salesRep,
        session,
        error: undefined
      };
      
    } catch (error) {
      console.error('❌ Session check error:', error);
      return {
        salesRep: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Logout current user
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      console.log('✅ Mobile logout successful');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Mobile logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const mobileAuthService = new MobileAuthService();
