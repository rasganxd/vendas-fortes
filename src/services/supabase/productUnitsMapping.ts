
import { supabase } from '@/integrations/supabase/client';
import { ProductUnitWithMapping, UnitConversionFactor } from '@/types/productUnits';

export const productUnitsMappingService = {
  // Buscar todas as unidades de um produto
  async getProductUnits(productId: string): Promise<ProductUnitWithMapping[]> {
    const { data, error } = await supabase
      .from('product_units_mapping')
      .select(`
        id,
        is_main_unit,
        product_units (
          id,
          value,
          label,
          package_quantity
        )
      `)
      .eq('product_id', productId);

    if (error) {
      console.error('Erro ao buscar unidades do produto:', error);
      throw error;
    }

    return data.map(mapping => ({
      id: mapping.product_units.id,
      value: mapping.product_units.value,
      label: mapping.product_units.label,
      packageQuantity: Number(mapping.product_units.package_quantity),
      isMainUnit: mapping.is_main_unit
    }));
  },

  // Adicionar unidade a um produto
  async addUnitToProduct(productId: string, unitId: string, isMainUnit: boolean = false): Promise<void> {
    // Se for definida como unidade principal, remover flag de outras unidades
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
      console.error('Erro ao adicionar unidade ao produto:', error);
      throw error;
    }
  },

  // Remover unidade de um produto
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
    // Primeiro, remove a flag de unidade principal de todas as unidades
    const { error: updateError } = await supabase
      .from('product_units_mapping')
      .update({ is_main_unit: false })
      .eq('product_id', productId);

    if (updateError) {
      console.error('Erro ao remover flags de unidade principal:', updateError);
      throw updateError;
    }

    // Depois, define a unidade específica como principal
    const { error: setError } = await supabase
      .from('product_units_mapping')
      .update({ is_main_unit: true })
      .eq('product_id', productId)
      .eq('unit_id', unitId);

    if (setError) {
      console.error('Erro ao definir unidade principal:', setError);
      throw setError;
    }
  },

  // Calcular fator de conversão entre duas unidades (LÓGICA CORRIGIDA)
  async calculateConversionFactor(fromUnitId: string, toUnitId: string): Promise<number> {
    if (fromUnitId === toUnitId) return 1;

    // Buscar informações das duas unidades
    const { data: units, error } = await supabase
      .from('product_units')
      .select('id, package_quantity')
      .in('id', [fromUnitId, toUnitId]);

    if (error || !units || units.length !== 2) {
      console.error('Erro ao buscar unidades para conversão:', error);
      throw new Error('Unidades não encontradas');
    }

    const fromUnit = units.find(u => u.id === fromUnitId);
    const toUnit = units.find(u => u.id === toUnitId);

    if (!fromUnit || !toUnit) {
      throw new Error('Unidades não encontradas');
    }

    // Lógica corrigida: 
    // Se quero converter de uma unidade maior (18 unidades) para menor (1 unidade)
    // O fator deve ser fromUnit.packageQuantity / toUnit.packageQuantity
    // Exemplo: de PCT18 (18) para UN (1) = 18 / 1 = 18
    // Isso significa que 1 PCT18 = 18 UN
    return Number(fromUnit.package_quantity) / Number(toUnit.package_quantity);
  }
};
