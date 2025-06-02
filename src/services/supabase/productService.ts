
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('code');

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }

    return data?.map(product => ({
      id: product.id,
      code: product.code,
      name: product.name,
      main_unit_id: product.main_unit_id,
      sub_unit_id: product.sub_unit_id,
      cost_price: product.cost_price,
      stock: product.stock,
      category_id: product.category_id,
      group_id: product.group_id,
      brand_id: product.brand_id,
      active: product.active,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    })) || [];
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        code: product.code,
        name: product.name,
        main_unit_id: product.main_unit_id,
        sub_unit_id: product.sub_unit_id,
        cost_price: product.cost_price,
        stock: product.stock,
        category_id: product.category_id,
        group_id: product.group_id,
        brand_id: product.brand_id,
        active: product.active
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      main_unit_id: data.main_unit_id,
      sub_unit_id: data.sub_unit_id,
      cost_price: data.cost_price,
      stock: data.stock,
      category_id: data.category_id,
      group_id: data.group_id,
      brand_id: data.brand_id,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        code: product.code,
        name: product.name,
        main_unit_id: product.main_unit_id,
        sub_unit_id: product.sub_unit_id,
        cost_price: product.cost_price,
        stock: product.stock,
        category_id: product.category_id,
        group_id: product.group_id,
        brand_id: product.brand_id,
        active: product.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      main_unit_id: data.main_unit_id,
      sub_unit_id: data.sub_unit_id,
      cost_price: data.cost_price,
      stock: data.stock,
      category_id: data.category_id,
      group_id: data.group_id,
      brand_id: data.brand_id,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }
};
