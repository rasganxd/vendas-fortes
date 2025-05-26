import { supabase } from '@/integrations/supabase/client';

export interface ApiToken {
  id: string;
  token: string;
  sales_rep_id: string;
  name: string;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTokenRequest {
  sales_rep_id: string;
  name: string;
  expires_days?: number;
}

class ApiTokenService {
  async generateToken(request: CreateTokenRequest): Promise<string> {
    try {
      console.log('🔑 Generating API token:', request);
      
      const { data, error } = await supabase.rpc('generate_api_token', {
        p_sales_rep_id: request.sales_rep_id,
        p_name: request.name,
        p_expires_days: request.expires_days || null
      });
      
      if (error) {
        console.error('❌ Error generating token:', error);
        throw error;
      }
      
      console.log('✅ Token generated successfully');
      return data;
    } catch (error) {
      console.error('❌ Error in generateToken:', error);
      throw error;
    }
  }

  async getTokensBySalesRep(salesRepId: string): Promise<ApiToken[]> {
    try {
      console.log('🔍 Getting tokens for sales rep:', salesRepId);
      
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .eq('sales_rep_id', salesRepId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error getting tokens:', error);
        throw error;
      }
      
      console.log('✅ Found tokens:', data?.length || 0);
      
      // Transform data to match ApiToken interface
      const transformedData = data?.map(token => ({
        ...token,
        permissions: Array.isArray(token.permissions) 
          ? token.permissions 
          : typeof token.permissions === 'string'
            ? [token.permissions]
            : ['read', 'write']
      })) || [];
      
      return transformedData;
    } catch (error) {
      console.error('❌ Error in getTokensBySalesRep:', error);
      throw error;
    }
  }

  async revokeToken(tokenId: string): Promise<void> {
    try {
      console.log('🚫 Revoking token:', tokenId);
      
      const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);
      
      if (error) {
        console.error('❌ Error revoking token:', error);
        throw error;
      }
      
      console.log('✅ Token revoked successfully');
    } catch (error) {
      console.error('❌ Error in revokeToken:', error);
      throw error;
    }
  }

  async deleteToken(tokenId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting token:', tokenId);
      
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId);
      
      if (error) {
        console.error('❌ Error deleting token:', error);
        throw error;
      }
      
      console.log('✅ Token deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteToken:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<string | null> {
    try {
      console.log('🔍 Validating token');
      
      const { data, error } = await supabase.rpc('validate_api_token', {
        token_value: token
      });
      
      if (error) {
        console.error('❌ Error validating token:', error);
        return null;
      }
      
      console.log('✅ Token validation result:', data ? 'valid' : 'invalid');
      return data;
    } catch (error) {
      console.error('❌ Error in validateToken:', error);
      return null;
    }
  }
}

export const apiTokenService = new ApiTokenService();
