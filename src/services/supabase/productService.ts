
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
      description: item.description || '',
      cost: item.cost || 0,
      price: item.price || 0,
      stock: item.stock || 0,
      minStock: item.min_stock || 0,
      minPrice: item.min_price || undefined,
      maxPrice: item.max_price || undefined,
      unit: item.unit || 'UN',
      categoryId: item.category_id,
      groupId: item.group_id,
      brandId: item.brand_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      syncStatus: (item.sync_status || 'synced') as 'synced' | 'pending' | 'error'
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
      description: data.description || '',
      cost: data.cost || 0,
      price: data.price || 0,
      stock: data.stock || 0,
      minStock: data.min_stock || 0,
      minPrice: data.min_price || undefined,
      maxPrice: data.max_price || undefined,
      unit: data.unit || 'UN',
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: (data.sync_status || 'synced') as 'synced' | 'pending' | 'error'
    };
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    console.log('Creating product with data:', product);
    
    // Prepare data for Supabase (remove any undefined values)
    const productData = {
      code: product.code,
      name: product.name,
      description: product.description || '',
      cost: product.cost || 0,
      price: product.price || 0,
      stock: product.stock || 0,
      min_stock: product.minStock || 0,
      min_price: product.minPrice || null,
      max_price: product.maxPrice || null,
      unit: product.unit || 'UN',
      category_id: product.categoryId || null,
      group_id: product.groupId || null,
      brand_id: product.brandId || null,
      sync_status: product.syncStatus || 'synced'
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
      description: data.description,
      cost: data.cost,
      price: data.price,
      stock: data.stock,
      minStock: data.min_stock,
      minPrice: data.min_price || undefined,
      maxPrice: data.max_price || undefined,
      unit: data.unit,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: (data.sync_status || 'synced') as 'synced' | 'pending' | 'error'
    };

    console.log('Created product:', createdProduct);
    return createdProduct;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    // Prepare data for Supabase
    const updateData: any = {};
    
    if (product.code !== undefined) updateData.code = product.code;
    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.cost !== undefined) updateData.cost = product.cost;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.minStock !== undefined) updateData.min_stock = product.minStock;
    if (product.minPrice !== undefined) updateData.min_price = product.minPrice;
    if (product.maxPrice !== undefined) updateData.max_price = product.maxPrice;
    if (product.unit !== undefined) updateData.unit = product.unit;
    if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
    if (product.groupId !== undefined) updateData.group_id = product.groupId;
    if (product.brandId !== undefined) updateData.brand_id = product.brandId;
    if (product.syncStatus !== undefined) updateData.sync_status = product.syncStatus;

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
      description: data.description,
      cost: data.cost,
      price: data.price,
      stock: data.stock,
      minStock: data.min_stock,
      minPrice: data.min_price || undefined,
      maxPrice: data.max_price || undefined,
      unit: data.unit,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: (data.sync_status || 'synced') as 'synced' | 'pending' | 'error'
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
