
import { supabase } from '@/integrations/supabase/client';
import { SalesRep } from '@/types';

interface AuthResult {
  success: boolean;
  salesRep?: SalesRep;
  session?: any;
  error?: string;
}

class MobileAuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Attempting mobile login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Login error:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      if (!data.user) {
        return {
          success: false,
          error: 'No user data returned'
        };
      }
      
      // Try to find corresponding sales rep
      const { data: salesReps, error: salesRepError } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();
      
      if (salesRepError || !salesReps) {
        console.warn('⚠️ No sales rep found for email:', email);
        return {
          success: false,
          error: 'Vendedor não encontrado ou inativo'
        };
      }
      
      const salesRep: SalesRep = {
        id: salesReps.id,
        code: salesReps.code,
        name: salesReps.name,
        email: salesReps.email,
        phone: salesReps.phone,
        active: salesReps.active,
        createdAt: new Date(salesReps.created_at),
        updatedAt: new Date(salesReps.updated_at)
      };
      
      console.log('✅ Login successful for sales rep:', salesRep.name);
      
      return {
        success: true,
        salesRep,
        session: data.session
      };
      
    } catch (error) {
      console.error('❌ Login exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado'
      };
    }
  }
  
  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthResult> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      if (!session?.user) {
        return {
          success: false,
          error: 'No active session'
        };
      }
      
      // Try to find corresponding sales rep
      const { data: salesReps, error: salesRepError } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('email', session.user.email)
        .eq('active', true)
        .single();
      
      if (salesRepError || !salesReps) {
        console.warn('⚠️ No sales rep found for session user');
        return {
          success: false,
          error: 'Vendedor não encontrado'
        };
      }
      
      const salesRep: SalesRep = {
        id: salesReps.id,
        code: salesReps.code,
        name: salesReps.name,
        email: salesReps.email,
        phone: salesReps.phone,
        active: salesReps.active,
        createdAt: new Date(salesReps.created_at),
        updatedAt: new Date(salesReps.updated_at)
      };
      
      return {
        success: true,
        salesRep,
        session
      };
      
    } catch (error) {
      console.error('❌ Session check exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado'
      };
    }
  }
  
  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout exception:', error);
      throw error;
    }
  }
}

export const mobileAuthService = new MobileAuthService();
