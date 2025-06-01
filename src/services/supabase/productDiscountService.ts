
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
    const { data, error } = await supabase
      .from('product_discount_settings')
      .upsert({
        product_id: productId,
        max_discount_percentage: maxDiscountPercentage,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar configuração de desconto:', error);
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

  async delete(productId: string): Promise<void> {
    const { error } = await supabase
      .from('product_discount_settings')
      .delete()
      .eq('product_id', productId);
    
    if (error) {
      console.error('Erro ao excluir configuração de desconto:', error);
      throw error;
    }
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
