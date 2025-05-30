
import { supabase } from '@/integrations/supabase/client';
import { ProductUnitMapping, ProductUnitWithMapping } from '@/types/productUnits';

export const productUnitsMappingService = {
  // Buscar todas as unidades de um produto
  async getProductUnits(productId: string): Promise<ProductUnitWithMapping[]> {
    const { data, error } = await supabase.rpc('get_product_units', {
      p_product_id: productId
    });

    if (error) {
      console.error('Erro ao buscar unidades do produto:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.unit_id,
      value: item.unit_value,
      label: item.unit_label,
      packageQuantity: Number(item.package_quantity),
      isMainUnit: item.is_main_unit
    }));
  },

  // Calcular fator de conversão entre unidades
  async calculateConversionFactor(fromUnitId: string, toUnitId: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_unit_conversion_factor', {
      p_from_unit_id: fromUnitId,
      p_to_unit_id: toUnitId
    });

    if (error) {
      console.error('Erro ao calcular fator de conversão:', error);
      throw error;
    }

    return Number(data) || 1;
  },

  // Associar unidade a produto
  async addUnitToProduct(productId: string, unitId: string, isMainUnit: boolean = false): Promise<string> {
    const { data, error } = await supabase
      .from('product_units_mapping')
      .insert({
        product_id: productId,
        unit_id: unitId,
        is_main_unit: isMainUnit
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao associar unidade ao produto:', error);
      throw error;
    }

    return data.id;
  },

  // Remover unidade de produto
  async removeUnitFromProduct(productId: string, unitId: string): Promise<void> {
    const { error } = await supabase
      .from('product_units_mapping')
      .delete()
      .eq('product_id', productId)
      .eq('unit_id', unitId);

    if (error) {
      console.error('Erro ao remover unidade do produto:', error);
      throw error;
    }
  },

  // Definir unidade principal
  async setMainUnit(productId: string, unitId: string): Promise<void> {
    // Primeiro, remover a flag de unidade principal de todas as unidades do produto
    const { error: updateError } = await supabase
      .from('product_units_mapping')
      .update({ is_main_unit: false })
      .eq('product_id', productId);

    if (updateError) {
      console.error('Erro ao atualizar unidades principais:', updateError);
      throw updateError;
    }

    // Depois, definir a nova unidade principal
    const { error: setMainError } = await supabase
      .from('product_units_mapping')
      .update({ is_main_unit: true })
      .eq('product_id', productId)
      .eq('unit_id', unitId);

    if (setMainError) {
      console.error('Erro ao definir unidade principal:', setMainError);
      throw setMainError;
    }

    // Atualizar o main_unit_id na tabela products
    const { error: updateProductError } = await supabase
      .from('products')
      .update({ main_unit_id: unitId })
      .eq('id', productId);

    if (updateProductError) {
      console.error('Erro ao atualizar unidade principal do produto:', updateProductError);
      throw updateProductError;
    }
  },

  // Buscar unidade principal de um produto
  async getMainUnit(productId: string): Promise<ProductUnitWithMapping | null> {
    const units = await this.getProductUnits(productId);
    return units.find(unit => unit.isMainUnit) || null;
  }
};
