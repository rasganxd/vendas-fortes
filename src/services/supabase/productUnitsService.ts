
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types/unit';
import { unitUsageService } from './unitUsageService';

export interface DatabaseUnit {
  id: string;
  value: string;
  label: string;
  package_quantity: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const productUnitsService = {
  // Buscar todas as unidades
  async getAll(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('product_units')
      .select('*')
      .order('value');

    if (error) {
      console.error('Erro ao buscar unidades:', error);
      throw error;
    }

    return data.map(unit => ({
      id: unit.id,
      value: unit.value,
      label: unit.label,
      packageQuantity: Number(unit.package_quantity)
    }));
  },

  // Adicionar nova unidade
  async add(unit: Omit<Unit, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('product_units')
      .insert({
        value: unit.value.toUpperCase(),
        label: unit.label,
        package_quantity: unit.packageQuantity,
        is_default: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao adicionar unidade:', error);
      throw error;
    }

    return data.id;
  },

  // Atualizar unidade existente
  async update(value: string, unit: Partial<Unit>): Promise<void> {
    const updateData: any = {};
    
    if (unit.value) updateData.value = unit.value.toUpperCase();
    if (unit.label) updateData.label = unit.label;
    if (unit.packageQuantity !== undefined) updateData.package_quantity = unit.packageQuantity;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('product_units')
      .update(updateData)
      .eq('value', value);

    if (error) {
      console.error('Erro ao atualizar unidade:', error);
      throw error;
    }
  },

  // Remover unidade com verificações de uso
  async remove(value: string): Promise<void> {
    try {
      console.log('🔍 Verificando uso da unidade antes da exclusão:', value);
      
      // Verificar se a unidade está sendo usada
      const usageInfo = await unitUsageService.checkUnitUsage(value);
      
      if (usageInfo.isUsed) {
        const productsList = usageInfo.usedInProducts.slice(0, 5).join(', ');
        const moreProducts = usageInfo.usedInProducts.length > 5 ? 
          ` e mais ${usageInfo.usedInProducts.length - 5} produto(s)` : '';
        
        throw new Error(
          `Esta unidade não pode ser excluída porque está sendo usada em: ${productsList}${moreProducts}. ` +
          `Remova ou altere a unidade destes produtos antes de excluí-la.`
        );
      }

      console.log('✅ Unidade não está em uso, prosseguindo com exclusão');

      const { error } = await supabase
        .from('product_units')
        .delete()
        .eq('value', value);

      if (error) {
        console.error('Erro ao remover unidade:', error);
        
        // Verificar se é erro de foreign key constraint
        if (error.code === '23503') {
          throw new Error(
            'Esta unidade não pode ser excluída porque está sendo referenciada por outros dados. ' +
            'Verifique se não há produtos ou mapeamentos usando esta unidade.'
          );
        }
        
        throw error;
      }

      console.log('✅ Unidade removida com sucesso');
    } catch (error: any) {
      console.error('❌ Erro durante remoção da unidade:', error);
      throw error;
    }
  },

  // Resetar para unidades padrão
  async resetToDefault(): Promise<void> {
    // Primeiro, remove todas as unidades não padrão
    const { error: deleteError } = await supabase
      .from('product_units')
      .delete()
      .eq('is_default', false);

    if (deleteError) {
      console.error('Erro ao limpar unidades customizadas:', deleteError);
      throw deleteError;
    }

    // As unidades padrão já estão no banco, não precisa reinseri-las
  },

  // Verificar se unidade pode ser excluída
  async canDelete(value: string): Promise<{ canDelete: boolean; reason?: string; usedInProducts?: string[] }> {
    try {
      const usageInfo = await unitUsageService.checkUnitUsage(value);
      
      if (usageInfo.isUsed) {
        return {
          canDelete: false,
          reason: `Unidade está sendo usada em ${usageInfo.usageCount} produto(s)`,
          usedInProducts: usageInfo.usedInProducts
        };
      }
      
      return { canDelete: true };
    } catch (error) {
      console.error('Erro ao verificar se unidade pode ser excluída:', error);
      return {
        canDelete: false,
        reason: 'Erro ao verificar uso da unidade'
      };
    }
  }
};
