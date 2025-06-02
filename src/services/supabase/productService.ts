
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

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
    
    // Transform database fields to Product interface
    return (data || []).map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: '', // Database doesn't have description field, so use empty string
      cost: item.cost_price || 0,
      price: item.cost_price || 0, // Using cost_price as base price for now
      stock: item.stock || 0,
      minStock: 0,
      maxDiscountPercent: item.max_discount_percent || 0,
      maxPrice: undefined,
      unit: 'UN',
      subunit: undefined,
      hasSubunit: false,
      subunitRatio: 1,
      categoryId: item.category_id,
      groupId: item.group_id,
      brandId: item.brand_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    }));
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
    
    // Transform database fields to Product interface
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: '', // Database doesn't have description field, so use empty string
      cost: data.cost_price || 0,
      price: data.cost_price || 0,
      stock: data.stock || 0,
      minStock: 0,
      maxDiscountPercent: data.max_discount_percent || 0,
      maxPrice: undefined,
      unit: 'UN',
      subunit: undefined,
      hasSubunit: false,
      subunitRatio: 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    };
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    console.log('Creating product with data:', product);
    
    // Prepare data for Supabase
    const productData = {
      code: product.code,
      name: product.name,
      cost_price: product.cost || 0,
      stock: product.stock || 0,
      max_discount_percent: product.maxDiscountPercent || 0,
      category_id: product.categoryId || null,
      group_id: product.groupId || null,
      brand_id: product.brandId || null,
      main_unit_id: '00000000-0000-0000-0000-000000000001', // Default unit ID
      active: true
    };

    console.log('Supabase product data:', productData);

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }

    // Transform the response to match our Product interface
    const createdProduct: Product = {
      id: data.id,
      code: data.code,
      name: data.name,
      description: '',
      cost: data.cost_price,
      price: data.cost_price,
      stock: data.stock,
      minStock: 0,
      maxDiscountPercent: data.max_discount_percent || 0,
      maxPrice: undefined,
      unit: 'UN',
      subunit: undefined,
      hasSubunit: false,
      subunitRatio: 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    };

    console.log('Created product:', createdProduct);
    return createdProduct;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    // Prepare data for Supabase
    const updateData: any = {};
    
    if (product.code !== undefined) updateData.code = product.code;
    if (product.name !== undefined) updateData.name = product.name;
    if (product.cost !== undefined) updateData.cost_price = product.cost;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.maxDiscountPercent !== undefined) updateData.max_discount_percent = product.maxDiscountPercent;
    if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
    if (product.groupId !== undefined) updateData.group_id = product.groupId;
    if (product.brandId !== undefined) updateData.brand_id = product.brandId;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }

    // Transform the response to match our Product interface
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: '',
      cost: data.cost_price,
      price: data.cost_price,
      stock: data.stock,
      minStock: 0,
      maxDiscountPercent: data.max_discount_percent || 0,
      maxPrice: undefined,
      unit: 'UN',
      subunit: undefined,
      hasSubunit: false,
      subunitRatio: 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  }
};
