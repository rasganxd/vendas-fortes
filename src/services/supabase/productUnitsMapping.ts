
import { supabase } from '@/integrations/supabase/client';
import { ProductUnitWithMapping } from '@/types/productUnits';

// Helper function para validar UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const productUnitsMappingService = {
  // Buscar unidades de um produto específico
  async getProductUnits(productId: string): Promise<ProductUnitWithMapping[]> {
    try {
      console.log('🔍 Buscando unidades do produto:', productId);
      
      if (!isValidUUID(productId)) {
        throw new Error(`ID do produto inválido: ${productId}`);
      }
      
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

  // Adicionar unidade a um produto
  async addUnitToProduct(productId: string, unitId: string, isMainUnit: boolean = false): Promise<void> {
    try {
      console.log('➕ Adicionando unidade ao produto:', { productId, unitId, isMainUnit });

      // Validar UUIDs
      if (!isValidUUID(productId)) {
        throw new Error(`ID do produto inválido: ${productId}`);
      }
      
      if (!isValidUUID(unitId)) {
        throw new Error(`ID da unidade inválido: ${unitId}`);
      }

      // Verificar se a unidade já existe para este produto
      const { data: existing } = await supabase
        .from('product_units_mapping')
        .select('id')
        .eq('product_id', productId)
        .eq('unit_id', unitId)
        .single();

      if (existing) {
        console.log('⚠️ Unidade já existe para este produto:', { productId, unitId });
        throw new Error('Esta unidade já foi adicionada a este produto');
      }

      // Se esta será a unidade principal, remover flag de outras unidades
      if (isMainUnit) {
        const { error: updateError } = await supabase
          .from('product_units_mapping')
          .update({ is_main_unit: false })
          .eq('product_id', productId);
          
        if (updateError) {
          console.error('❌ Erro ao atualizar unidades principais existentes:', updateError);
          throw updateError;
        }
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

      // Validar UUIDs
      if (!isValidUUID(productId)) {
        throw new Error(`ID do produto inválido: ${productId}`);
      }
      
      if (!isValidUUID(unitId)) {
        throw new Error(`ID da unidade inválido: ${unitId}`);
      }

      // Verificar se é a única unidade do produto
      const { data: allUnits } = await supabase
        .from('product_units_mapping')
        .select('id, is_main_unit')
        .eq('product_id', productId);

      if (allUnits && allUnits.length === 1) {
        throw new Error('Não é possível remover a única unidade do produto');
      }

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

      // Validar UUIDs
      if (!isValidUUID(productId)) {
        throw new Error(`ID do produto inválido: ${productId}`);
      }
      
      if (!isValidUUID(unitId)) {
        throw new Error(`ID da unidade inválido: ${unitId}`);
      }

      // Verificar se a unidade existe para este produto
      const { data: unitExists } = await supabase
        .from('product_units_mapping')
        .select('id')
        .eq('product_id', productId)
        .eq('unit_id', unitId)
        .single();

      if (!unitExists) {
        throw new Error('A unidade especificada não está associada a este produto');
      }

      // Primeiro, remover flag de todas as unidades do produto
      const { error: updateAllError } = await supabase
        .from('product_units_mapping')
        .update({ is_main_unit: false })
        .eq('product_id', productId);
        
      if (updateAllError) {
        console.error('❌ Erro ao remover flag de unidades principais:', updateAllError);
        throw updateAllError;
      }

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

      // Validar UUIDs
      if (!isValidUUID(fromUnitId) || !isValidUUID(toUnitId)) {
        console.error('❌ IDs de unidade inválidos para conversão:', { fromUnitId, toUnitId });
        return 1;
      }

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
