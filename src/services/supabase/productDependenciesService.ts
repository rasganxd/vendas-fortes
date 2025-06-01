
import { supabase } from '@/integrations/supabase/client';

export interface ProductDependency {
  dependency_type: string;
  dependency_count: number;
  can_delete: boolean;
  details: {
    message: string;
    table: string;
    blocking?: boolean;
  };
}

export interface ProductDeletionResult {
  success: boolean;
  error?: string;
  message?: string;
  blocking_dependencies?: number;
  removed_dependencies?: any[];
  force_delete_used?: boolean;
}

export const productDependenciesService = {
  async checkDependencies(productId: string): Promise<ProductDependency[]> {
    const { data, error } = await supabase.rpc('check_product_dependencies', {
      p_product_id: productId
    });

    if (error) {
      console.error('Error checking product dependencies:', error);
      throw error;
    }

    return (data || []) as ProductDependency[];
  },

  async deleteWithDependencies(
    productId: string, 
    forceDelete: boolean = false
  ): Promise<ProductDeletionResult> {
    const { data, error } = await supabase.rpc('delete_product_with_dependencies', {
      p_product_id: productId,
      p_force_delete: forceDelete
    });

    if (error) {
      console.error('Error deleting product with dependencies:', error);
      throw error;
    }

    return data as unknown as ProductDeletionResult;
  }
};
