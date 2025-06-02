
import { supabase } from '@/integrations/supabase/client';
import { apiTokenService } from './apiTokenService';
import { salesRepService } from './salesRepService';

export interface MobileAuthRequest {
  salesRepCode: number;
  password: string;
}

export interface MobileAuthResponse {
  success: boolean;
  salesRep?: {
    id: string;
    code: number;
    name: string;
    email?: string;
  };
  token?: string;
  error?: string;
}

export interface SyncDataResponse {
  customers: any[];
  products: any[];
  paymentTables: any[];
  lastSync: string;
}

class MobileIntegrationService {
  /**
   * Autentica vendedor mobile usando código + senha
   * Gera token de API automaticamente se autenticação bem-sucedida
   */
  async authenticateMobile(request: MobileAuthRequest): Promise<MobileAuthResponse> {
    try {
      console.log('🔐 Authenticating mobile user with code:', request.salesRepCode);
      
      // Buscar vendedor pelo código
      const salesReps = await salesRepService.getAll();
      const salesRep = salesReps.find(rep => rep.code === request.salesRepCode && rep.active);
      
      if (!salesRep) {
        return {
          success: false,
          error: 'Vendedor não encontrado ou inativo'
        };
      }
      
      // TODO: Implementar validação de senha
      // Por enquanto, aceitar qualquer senha para o vendedor ativo
      console.log('✅ Sales rep found:', salesRep.name);
      
      // Gerar token de API para o vendedor
      const tokenName = `Mobile App - ${new Date().toLocaleDateString('pt-BR')}`;
      const token = await apiTokenService.generateToken({
        sales_rep_id: salesRep.id,
        name: tokenName,
        expires_days: 30 // Token válido por 30 dias
      });
      
      return {
        success: true,
        salesRep: {
          id: salesRep.id,
          code: salesRep.code,
          name: salesRep.name,
          email: salesRep.email
        },
        token
      };
    } catch (error) {
      console.error('❌ Error in mobile authentication:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
  
  /**
   * Valida token de API mobile
   */
  async validateMobileToken(token: string): Promise<string | null> {
    try {
      const salesRepId = await apiTokenService.validateToken(token);
      return salesRepId;
    } catch (error) {
      console.error('❌ Error validating mobile token:', error);
      return null;
    }
  }
  
  /**
   * Obtém dados sincronizados para o mobile
   */
  async getSyncData(salesRepId: string): Promise<SyncDataResponse> {
    try {
      console.log('📱 Getting sync data for sales rep:', salesRepId);
      
      // Buscar clientes do vendedor
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('sales_rep_id', salesRepId)
        .eq('active', true)
        .order('name');
      
      if (customersError) {
        console.error('Error fetching customers:', customersError);
      }
      
      // Buscar produtos ativos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_brands!inner(name),
          product_categories(name),
          product_groups(name)
        `)
        .eq('active', true)
        .order('name');
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
      }
      
      // Buscar tabelas de pagamento ativas
      const { data: paymentTables, error: paymentError } = await supabase
        .from('payment_tables')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (paymentError) {
        console.error('Error fetching payment tables:', paymentError);
      }
      
      return {
        customers: customers || [],
        products: products || [],
        paymentTables: paymentTables || [],
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting sync data:', error);
      throw new Error('Erro ao sincronizar dados');
    }
  }
  
  /**
   * Recebe pedido do mobile e salva no sistema
   */
  async receiveMobileOrder(orderData: any, salesRepId: string): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      console.log('📱 Receiving mobile order from sales rep:', salesRepId);
      
      // Validar dados básicos do pedido
      if (!orderData.customer_id || !orderData.items || orderData.items.length === 0) {
        return {
          success: false,
          error: 'Dados do pedido inválidos'
        };
      }
      
      // Inserir pedido na tabela orders_mobile
      const { data: order, error: orderError } = await supabase
        .from('orders_mobile')
        .insert({
          customer_id: orderData.customer_id,
          customer_name: orderData.customer_name,
          sales_rep_id: salesRepId,
          sales_rep_name: orderData.sales_rep_name,
          date: orderData.date || new Date().toISOString(),
          due_date: orderData.due_date,
          delivery_date: orderData.delivery_date,
          total: orderData.total,
          discount: orderData.discount || 0,
          status: 'pending',
          payment_status: orderData.payment_status || 'pending',
          payment_method: orderData.payment_method,
          payment_table: orderData.payment_table,
          notes: orderData.notes,
          delivery_address: orderData.delivery_address,
          mobile_order_id: orderData.mobile_order_id,
          source_project: 'mobile'
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Error inserting mobile order:', orderError);
        return {
          success: false,
          error: 'Erro ao salvar pedido'
        };
      }
      
      // Inserir itens do pedido
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit: item.unit || 'UN',
        unit_price: item.unit_price,
        price: item.price,
        discount: item.discount || 0,
        total: item.total
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items_mobile')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error inserting mobile order items:', itemsError);
        return {
          success: false,
          error: 'Erro ao salvar itens do pedido'
        };
      }
      
      console.log('✅ Mobile order saved successfully:', order.id);
      
      return {
        success: true,
        orderId: order.id
      };
    } catch (error) {
      console.error('❌ Error receiving mobile order:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

export const mobileIntegrationService = new MobileIntegrationService();
