
import { supabase } from '@/integrations/supabase/client';
import { ProductDiscountSetting } from '@/types';

export const productDiscountService = {
  async getByProductId(productId: string): Promise<ProductDiscountSetting | null> {
    const { data, error } = await supabase
      .from('product_discount_settings')
      .select('*')
      .eq('product_id', productId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      console.error('Erro ao buscar configuração de desconto:', error);
      throw error;
    }
    
    return {
      id: data.id,
      productId: data.product_id,
      maxDiscountPercentage: data.max_discount_percentage,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async upsert(productId: string, maxDiscountPercentage: number): Promise<ProductDiscountSetting> {
    console.log('🔄 ProductDiscountService.upsert - Starting upsert for product:', productId, 'with discount:', maxDiscountPercentage);
    
    const { data, error } = await supabase
      .from('product_discount_settings')
      .upsert({
        product_id: productId,
        max_discount_percentage: maxDiscountPercentage,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'product_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ ProductDiscountService.upsert - Error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Mensagem de erro mais específica baseada no tipo de erro
      if (error.code === '23505') {
        throw new Error('Conflito de chave única detectado. Tentando novamente...');
      } else if (error.code === 'PGRST116') {
        throw new Error('Erro de integridade dos dados. Verifique se o produto existe.');
      } else {
        throw new Error(`Erro ao salvar configuração de desconto: ${error.message}`);
      }
    }
    
    console.log('✅ ProductDiscountService.upsert - Success:', data);
    
    return {
      id: data.id,
      productId: data.product_id,
      maxDiscountPercentage: data.max_discount_percentage,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async delete(productId: string): Promise<void> {
    console.log('🔄 ProductDiscountService.delete - Deleting discount for product:', productId);
    
    const { error } = await supabase
      .from('product_discount_settings')
      .delete()
      .eq('product_id', productId);
    
    if (error) {
      console.error('❌ ProductDiscountService.delete - Error:', error);
      throw new Error(`Erro ao excluir configuração de desconto: ${error.message}`);
    }
    
    console.log('✅ ProductDiscountService.delete - Success');
  },

  async getAllDiscounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('product_discount_settings')
      .select('product_id, max_discount_percentage');
    
    if (error) {
      console.error('Erro ao buscar todas as configurações de desconto:', error);
      throw error;
    }
    
    const discounts: Record<string, number> = {};
    data?.forEach(item => {
      discounts[item.product_id] = item.max_discount_percentage;
    });
    
    return discounts;
  }
};
