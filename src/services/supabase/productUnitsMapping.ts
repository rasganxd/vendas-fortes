
import { supabase } from '@/integrations/supabase/client';
import { ProductUnitWithMapping } from '@/types/productUnits';

export const productUnitsMappingService = {
  // Buscar unidades de um produto específico
  async getProductUnits(productId: string): Promise<ProductUnitWithMapping[]> {
    try {
      console.log('🔍 Buscando unidades do produto:', productId);
      
      const { data, error } = await supabase
        .from('product_units_mapping')
        .select(`
          id,
          is_main_unit,
          product_units!inner(
            id,
            value,
            label,
            package_quantity
          )
        `)
        .eq('product_id', productId);

      if (error) {
        console.error('❌ Erro ao buscar unidades do produto:', error);
        throw error;
      }

      const units: ProductUnitWithMapping[] = (data || []).map(item => ({
        id: item.product_units.id,
        value: item.product_units.value,
        label: item.product_units.label,
        packageQuantity: item.product_units.package_quantity,
        isMainUnit: item.is_main_unit
      }));

      console.log('✅ Unidades do produto carregadas:', units);
      return units;
    } catch (error) {
      console.error('❌ Erro ao buscar unidades do produto:', error);
      throw error;
    }
  },

  // Sincronizar unidades de um produto com transação
  async syncProductUnits(productId: string, selectedUnits: Array<{
    unitId: string;
    isMainUnit: boolean;
  }>): Promise<void> {
    try {
      console.log('🔄 Sincronizando unidades do produto:', { productId, selectedUnits });

      if (selectedUnits.length === 0) {
        throw new Error('Produto deve ter pelo menos uma unidade');
      }

      const mainUnits = selectedUnits.filter(u => u.isMainUnit);
      if (mainUnits.length !== 1) {
        throw new Error('Produto deve ter exatamente uma unidade principal');
      }

      // Realizar operação em transação
      const { error } = await supabase.rpc('sync_product_units', {
        p_product_id: productId,
        p_units: selectedUnits
      });

      if (error) {
        console.error('❌ Erro ao sincronizar unidades:', error);
        throw error;
      }

      console.log('✅ Unidades sincronizadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao sincronizar unidades:', error);
      throw error;
    }
  },

  // Adicionar unidade a um produto
  async addUnitToProduct(productId: string, unitId: string, isMainUnit: boolean = false): Promise<void> {
    try {
      console.log('➕ Adicionando unidade ao produto:', { productId, unitId, isMainUnit });

      // Se esta será a unidade principal, remover flag de outras unidades
      if (isMainUnit) {
        await supabase
          .from('product_units_mapping')
          .update({ is_main_unit: false })
          .eq('product_id', productId);
      }

      const { error } = await supabase
        .from('product_units_mapping')
        .insert({
          product_id: productId,
          unit_id: unitId,
          is_main_unit: isMainUnit
        });

      if (error) {
        console.error('❌ Erro ao adicionar unidade ao produto:', error);
        throw error;
      }

      console.log('✅ Unidade adicionada ao produto com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar unidade ao produto:', error);
      throw error;
    }
  },

  // Remover unidade de um produto
  async removeUnitFromProduct(productId: string, unitId: string): Promise<void> {
    try {
      console.log('🗑️ Removendo unidade do produto:', { productId, unitId });

      const { error } = await supabase
        .from('product_units_mapping')
        .delete()
        .eq('product_id', productId)
        .eq('unit_id', unitId);

      if (error) {
        console.error('❌ Erro ao remover unidade do produto:', error);
        throw error;
      }

      console.log('✅ Unidade removida do produto com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover unidade do produto:', error);
      throw error;
    }
  },

  // Definir unidade principal
  async setMainUnit(productId: string, unitId: string): Promise<void> {
    try {
      console.log('👑 Definindo unidade principal:', { productId, unitId });

      // Primeiro, remover flag de todas as unidades do produto
      await supabase
        .from('product_units_mapping')
        .update({ is_main_unit: false })
        .eq('product_id', productId);

      // Depois, definir a nova unidade principal
      const { error } = await supabase
        .from('product_units_mapping')
        .update({ is_main_unit: true })
        .eq('product_id', productId)
        .eq('unit_id', unitId);

      if (error) {
        console.error('❌ Erro ao definir unidade principal:', error);
        throw error;
      }

      console.log('✅ Unidade principal definida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao definir unidade principal:', error);
      throw error;
    }
  },

  // Calcular fator de conversão entre unidades
  async calculateConversionFactor(fromUnitId: string, toUnitId: string): Promise<number> {
    try {
      if (fromUnitId === toUnitId) return 1;

      const { data, error } = await supabase.rpc('calculate_unit_conversion_factor', {
        p_from_unit_id: fromUnitId,
        p_to_unit_id: toUnitId
      });

      if (error) {
        console.error('❌ Erro ao calcular fator de conversão:', error);
        return 1;
      }

      return data || 1;
    } catch (error) {
      console.error('❌ Erro ao calcular fator de conversão:', error);
      return 1;
    }
  }
};
