import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

class ProductSupabaseService {
  async getAll(): Promise<Product[]> {
    try {
      console.log("Getting all products from Supabase...");
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error getting products:", error);
        return [];
      }
      
      const products = data?.map(item => ({
        id: item.id,
        code: item.code || 0,
        name: item.name,
        description: item.description || '',
        cost: item.cost || 0,
        price: item.price || 0,
        unit: item.unit || '',
        stock: item.stock || 0,
        minStock: item.min_stock || 0,
        categoryId: item.category_id || '',
        groupId: item.group_id || '',
        brandId: item.brand_id || '',
        syncStatus: (item.sync_status as 'synced' | 'pending' | 'error') || 'synced',
        photo: '',
        active: true,
        notes: '',
        maxDiscountPercentage: 0,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) || [];
      
      console.log(`Retrieved ${products.length} products from Supabase`);
      return products;
    } catch (error) {
      console.error("Error getting all products:", error);
      return [];
    }
  }
  
  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error getting product by ID:", error);
        return null;
      }
      
      return {
        id: data.id,
        code: data.code || 0,
        name: data.name,
        description: data.description || '',
        cost: data.cost || 0,
        price: data.price || 0,
        unit: data.unit || '',
        stock: data.stock || 0,
        minStock: data.min_stock || 0,
        categoryId: data.category_id || '',
        groupId: data.group_id || '',
        brandId: data.brand_id || '',
        syncStatus: (data.sync_status as 'synced' | 'pending' | 'error') || 'synced',
        photo: '',
        active: true,
        notes: '',
        maxDiscountPercentage: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product by ID:", error);
      return null;
    }
  }
  
  async add(product: Omit<Product, 'id'>): Promise<string> {
    try {
      const productData = {
        code: product.code,
        name: product.name,
        description: product.description,
        cost: product.cost,
        price: product.price,
        unit: product.unit,
        stock: product.stock,
        min_stock: product.minStock,
        category_id: product.categoryId,
        group_id: product.groupId,
        brand_id: product.brandId,
        sync_status: product.syncStatus || 'synced'
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();
      
      if (error) {
        console.error("Error adding product:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }
  
  async update(id: string, product: Partial<Product>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (product.code !== undefined) updateData.code = product.code;
      if (product.name !== undefined) updateData.name = product.name;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.cost !== undefined) updateData.cost = product.cost;
      if (product.price !== undefined) updateData.price = product.price;
      if (product.unit !== undefined) updateData.unit = product.unit;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.minStock !== undefined) updateData.min_stock = product.minStock;
      if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
      if (product.groupId !== undefined) updateData.group_id = product.groupId;
      if (product.brandId !== undefined) updateData.brand_id = product.brandId;
      if (product.syncStatus !== undefined) updateData.sync_status = product.syncStatus;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
  
  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_next_product_code');
      
      if (error) {
        console.error('Error generating product code:', error);
        const allProducts = await this.getAll();
        const maxCode = allProducts.reduce((max, product) => Math.max(max, product.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating product code:', error);
      return 1;
    }
  }
}

export const productService = new ProductSupabaseService();
