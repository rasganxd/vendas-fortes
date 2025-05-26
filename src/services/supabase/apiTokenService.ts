
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
      console.log('🔑 Starting token generation:', request);
      
      // Validate request
      if (!request.sales_rep_id || !request.name) {
        throw new Error('Sales rep ID and name are required');
      }

      console.log('🔑 Calling RPC function generate_api_token...');
      const { data, error } = await supabase.rpc('generate_api_token', {
        p_sales_rep_id: request.sales_rep_id,
        p_name: request.name,
        p_expires_days: request.expires_days || null
      });
      
      if (error) {
        console.error('❌ RPC Error generating token:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      if (!data) {
        console.error('❌ No data returned from RPC');
        throw new Error('Nenhum token foi retornado pelo servidor');
      }
      
      console.log('✅ Token generated successfully, length:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error in generateToken:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro desconhecido ao gerar token');
    }
  }

  async getTokensBySalesRep(salesRepId: string): Promise<ApiToken[]> {
    try {
      console.log('🔍 Getting tokens for sales rep:', salesRepId);
      
      if (!salesRepId) {
        throw new Error('Sales rep ID is required');
      }
      
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .eq('sales_rep_id', salesRepId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error getting tokens:', error);
        throw new Error(`Erro ao buscar tokens: ${error.message}`);
      }
      
      console.log('✅ Found tokens:', data?.length || 0);
      
      // Transform data to match ApiToken interface with proper type handling
      const transformedData: ApiToken[] = data?.map(token => ({
        id: token.id,
        token: token.token,
        sales_rep_id: token.sales_rep_id || '',
        name: token.name,
        expires_at: token.expires_at || undefined,
        last_used_at: token.last_used_at || undefined,
        is_active: token.is_active || false,
        created_at: token.created_at || '',
        updated_at: token.updated_at || '',
        permissions: this.parsePermissions(token.permissions)
      })) || [];
      
      return transformedData;
    } catch (error) {
      console.error('❌ Error in getTokensBySalesRep:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro desconhecido ao buscar tokens');
    }
  }

  private parsePermissions(permissions: any): string[] {
    // Handle different permission formats from database
    if (Array.isArray(permissions)) {
      return permissions.map(p => String(p));
    }
    
    if (typeof permissions === 'string') {
      try {
        const parsed = JSON.parse(permissions);
        return Array.isArray(parsed) ? parsed.map(p => String(p)) : [String(permissions)];
      } catch {
        return [permissions];
      }
    }
    
    // Default permissions if none specified
    return ['read', 'write'];
  }

  async revokeToken(tokenId: string): Promise<void> {
    try {
      console.log('🚫 Revoking token:', tokenId);
      
      if (!tokenId) {
        throw new Error('Token ID is required');
      }
      
      const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);
      
      if (error) {
        console.error('❌ Error revoking token:', error);
        throw new Error(`Erro ao revogar token: ${error.message}`);
      }
      
      console.log('✅ Token revoked successfully');
    } catch (error) {
      console.error('❌ Error in revokeToken:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro desconhecido ao revogar token');
    }
  }

  async deleteToken(tokenId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting token:', tokenId);
      
      if (!tokenId) {
        throw new Error('Token ID is required');
      }
      
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId);
      
      if (error) {
        console.error('❌ Error deleting token:', error);
        throw new Error(`Erro ao excluir token: ${error.message}`);
      }
      
      console.log('✅ Token deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteToken:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro desconhecido ao excluir token');
    }
  }

  async validateToken(token: string): Promise<string | null> {
    try {
      console.log('🔍 Validating token');
      
      if (!token) {
        console.log('❌ No token provided');
        return null;
      }
      
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
