
import { SalesRep } from '@/types';
import { salesRepLocalService } from './salesRepLocalService';

/**
 * Local authentication service for sales representatives
 */
export class SalesRepAuthService {
  /**
   * Authenticate sales rep using code and password
   * Note: This is a basic implementation for offline use
   * In production, passwords should be properly hashed and verified
   */
  static async authenticate(code: number, password: string): Promise<{
    success: boolean;
    salesRep?: Omit<SalesRep, 'password'>;
    error?: string;
  }> {
    try {
      console.log(`🔐 [Local] Attempting authentication for sales rep code: ${code}`);

      if (!code || !password) {
        return {
          success: false,
          error: 'Código e senha são obrigatórios'
        };
      }

      // Get sales rep by code from local storage
      const salesRep = await salesRepLocalService.getByCode(code);

      if (!salesRep) {
        console.log('❌ [Local] Sales rep not found');
        return {
          success: false,
          error: 'Vendedor não encontrado'
        };
      }

      if (!salesRep.active) {
        console.log('❌ [Local] Sales rep is inactive');
        return {
          success: false,
          error: 'Vendedor inativo'
        };
      }

      if (!salesRep.password) {
        console.log('❌ [Local] Sales rep has no password set');
        return {
          success: false,
          error: 'Senha não configurada para este vendedor'
        };
      }

      // Basic password verification for local use
      // Note: In a real scenario, you'd want to store hashed passwords locally too
      if (salesRep.password !== password) {
        console.log('❌ [Local] Invalid password');
        return {
          success: false,
          error: 'Código ou senha incorretos'
        };
      }

      console.log('✅ [Local] Sales rep authentication successful');

      // Return sales rep data without password
      const { password: _, ...salesRepData } = salesRep;

      return {
        success: true,
        salesRep: salesRepData
      };

    } catch (error) {
      console.error('❌ [Local] Error in sales rep authentication:', error);
      return {
        success: false,
        error: 'Erro interno durante autenticação'
      };
    }
  }

  /**
   * Get sales rep by code (without authentication)
   */
  static async getSalesRepByCode(code: number): Promise<SalesRep | null> {
    try {
      return await salesRepLocalService.getByCode(code);
    } catch (error) {
      console.error('Error getting sales rep by code:', error);
      return null;
    }
  }
}

export const salesRepAuthService = SalesRepAuthService;
