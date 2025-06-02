
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { transformProductFromDB, transformProductToDB, prepareProductForInsert } from './productTransformations';
import { productUnitsManager } from './productUnitsManager';

/**
 * Product CRUD operations
 */
export const productCrud = {
  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('code');
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return (data || []).map(transformProductFromDB);
  },

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return transformProductFromDB(data);
  },

  /**
   * Create new product
   */
  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { selectedUnits?: any[], mainUnitId?: string }): Promise<Product> {
    console.log('Creating product with data:', product);
    
    const insertData = prepareProductForInsert(product);
    
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single();
    
    if (productError) {
      console.error('Error creating product:', productError);
      throw productError;
    }

    // Associate units if provided
    if (product.selectedUnits && product.selectedUnits.length > 0) {
      await productUnitsManager.associateUnits(
        productData.id, 
        product.selectedUnits, 
        product.mainUnitId
      );
    }

    const createdProduct = transformProductFromDB(productData);
    console.log('Created product:', createdProduct);
    return createdProduct;
  },

  /**
   * Update existing product
   */
  async update(id: string, product: Partial<Product> & { selectedUnits?: any[], mainUnitId?: string }): Promise<Product> {
    console.log('Updating product:', id, product);
    
    const updateData = transformProductToDB(product);

    // Handle units update if provided
    if (product.selectedUnits) {
      await productUnitsManager.updateUnits(id, product.selectedUnits, product.mainUnitId);
    } else if (product.mainUnitId !== undefined) {
      updateData.main_unit_id = product.mainUnitId;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return transformProductFromDB(data);
  },

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};
