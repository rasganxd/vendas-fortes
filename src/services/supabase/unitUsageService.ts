
import { supabase } from '@/integrations/supabase/client';

export interface UnitUsageInfo {
  isUsed: boolean;
  usageCount: number;
  usedInProducts: string[];
  usedInMappings: number;
}

export const unitUsageService = {
  // Verificar se uma unidade está sendo usada
  async checkUnitUsage(unitValue: string): Promise<UnitUsageInfo> {
    try {
      // Verificar uso em produtos (sistema antigo)
      const { data: productsUsage, error: productsError } = await supabase
        .from('products')
        .select('name, unit, subunit')
        .or(`unit.eq.${unitValue},subunit.eq.${unitValue}`);

      if (productsError) {
        console.error('Erro ao verificar uso em produtos:', productsError);
        throw productsError;
      }

      // Verificar uso em mapeamentos (sistema novo)
      const { data: mappingsUsage, error: mappingsError } = await supabase
        .from('product_units_mapping')
        .select(`
          product_units!inner(value),
          products!inner(name)
        `)
        .eq('product_units.value', unitValue);

      if (mappingsError) {
        console.error('Erro ao verificar uso em mapeamentos:', mappingsError);
        throw mappingsError;
      }

      const usedInProducts = productsUsage?.map(p => p.name) || [];
      const mappingProducts = mappingsUsage?.map(m => m.products?.name).filter(Boolean) || [];
      
      const allUsedProducts = [...new Set([...usedInProducts, ...mappingProducts])];
      const totalUsage = (productsUsage?.length || 0) + (mappingsUsage?.length || 0);

      return {
        isUsed: totalUsage > 0,
        usageCount: totalUsage,
        usedInProducts: allUsedProducts,
        usedInMappings: mappingsUsage?.length || 0
      };
    } catch (error) {
      console.error('Erro ao verificar uso da unidade:', error);
      throw error;
    }
  },

  // Remover unidade de todos os produtos (sistema antigo)
  async removeUnitFromProducts(unitValue: string): Promise<void> {
    try {
      // Remover como unidade principal
      const { error: mainUnitError } = await supabase
        .from('products')
        .update({ unit: 'UN' })
        .eq('unit', unitValue);

      if (mainUnitError) {
        console.error('Erro ao remover unidade principal:', mainUnitError);
        throw mainUnitError;
      }

      // Remover como subunidade
      const { error: subUnitError } = await supabase
        .from('products')
        .update({ 
          subunit: null,
          has_subunit: false,
          subunit_ratio: null
        })
        .eq('subunit', unitValue);

      if (subUnitError) {
        console.error('Erro ao remover subunidade:', subUnitError);
        throw subUnitError;
      }
    } catch (error) {
      console.error('Erro ao remover unidade dos produtos:', error);
      throw error;
    }
  },

  // Remover mapeamentos da unidade (sistema novo)
  async removeUnitMappings(unitValue: string): Promise<void> {
    try {
      // Primeiro, buscar o ID da unidade
      const { data: unit, error: unitError } = await supabase
        .from('product_units')
        .select('id')
        .eq('value', unitValue)
        .single();

      if (unitError || !unit) {
        console.error('Erro ao buscar unidade:', unitError);
        return; // Unidade não existe, não há mapeamentos para remover
      }

      // Remover todos os mapeamentos desta unidade
      const { error: mappingError } = await supabase
        .from('product_units_mapping')
        .delete()
        .eq('unit_id', unit.id);

      if (mappingError) {
        console.error('Erro ao remover mapeamentos:', mappingError);
        throw mappingError;
      }
    } catch (error) {
      console.error('Erro ao remover mapeamentos da unidade:', error);
      throw error;
    }
  }
};
