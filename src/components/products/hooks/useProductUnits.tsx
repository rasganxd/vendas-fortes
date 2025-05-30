
import { useState, useEffect } from 'react';
import { Unit } from '@/types/unit';
import { UnitConverter } from '@/utils/unitConverter';
import { toast } from 'sonner';
import { productUnitsService } from '@/services/supabase/productUnitsService';

const DEFAULT_UNITS: Unit[] = [
  { id: 'un', value: 'UN', label: 'Unidade', packageQuantity: 1 },
  { id: 'kg', value: 'KG', label: 'Quilograma', packageQuantity: 1 },
  { id: 'lt', value: 'LT', label: 'Litro', packageQuantity: 1 },
  { id: 'mt', value: 'MT', label: 'Metro', packageQuantity: 1 },
  { id: 'cx', value: 'CX', label: 'Caixa', packageQuantity: 1 },
  { id: 'pc', value: 'PC', label: 'Peça', packageQuantity: 1 },
  { id: 'm2', value: 'M2', label: 'Metro Quadrado', packageQuantity: 1 },
  { id: 'm3', value: 'M3', label: 'Metro Cúbico', packageQuantity: 1 },
  { id: 'dz', value: 'DZ', label: 'Dúzia', packageQuantity: 12 },
  { id: 'gr', value: 'GR', label: 'Grama', packageQuantity: 0.001 },
];

export const useProductUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [converter] = useState(new UnitConverter(DEFAULT_UNITS));

  // Load units from database or use defaults
  const loadUnits = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading units from database...");
      
      const dbUnits = await productUnitsService.getAll();
      console.log("📦 Database units loaded:", dbUnits);
      
      if (dbUnits.length === 0) {
        console.log("⚠️ No units found in DB, using defaults");
        setUnits(DEFAULT_UNITS);
      } else {
        // Map database units to include id
        const mappedUnits = dbUnits.map(unit => ({
          id: unit.value.toLowerCase(),
          value: unit.value,
          label: unit.label,
          packageQuantity: unit.packageQuantity
        }));
        console.log("✅ Units mapped with IDs:", mappedUnits);
        setUnits(mappedUnits);
      }
    } catch (error) {
      console.error('❌ Error loading units:', error);
      console.log("🔄 Falling back to default units");
      setUnits(DEFAULT_UNITS);
      toast("Erro ao carregar unidades", {
        description: "Usando unidades padrão."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize default units in the database
  const initializeDefaultUnits = async () => {
    try {
      console.log("🔧 Initializing default units in database");
      
      for (const unit of DEFAULT_UNITS) {
        await productUnitsService.add({
          value: unit.value,
          label: unit.label,
          packageQuantity: unit.packageQuantity
        });
      }
      
      await loadUnits();
      toast("Unidades padrão inicializadas");
    } catch (error) {
      console.error('❌ Error initializing default units:', error);
      setUnits(DEFAULT_UNITS);
    }
  };

  // Add a new unit
  const addUnit = async (unit: Omit<Unit, 'id'>) => {
    try {
      console.log("➕ Adding new unit:", unit);
      const id = await productUnitsService.add(unit);
      const newUnit = { ...unit, id } as Unit;
      
      setUnits(prev => [...prev, newUnit]);
      
      toast("Unidade adicionada com sucesso");
      return id;
    } catch (error) {
      console.error('❌ Error adding unit:', error);
      toast("Erro ao adicionar unidade", {
        description: "Houve um problema ao adicionar a unidade."
      });
      throw error;
    }
  };

  // Update an existing unit
  const updateUnit = async (value: string, updates: Partial<Unit>) => {
    try {
      console.log("✏️ Updating unit:", value, updates);
      
      await productUnitsService.update(value, updates);
      
      setUnits(prev => prev.map(u => 
        u.value === value ? { ...u, ...updates } : u
      ));
      
      toast("Unidade atualizada com sucesso");
    } catch (error) {
      console.error('❌ Error updating unit:', error);
      toast("Erro ao atualizar unidade", {
        description: "Houve um problema ao atualizar a unidade."
      });
      throw error;
    }
  };

  // Delete a unit with improved error handling
  const deleteUnit = async (value: string) => {
    try {
      console.log("🗑️ Attempting to delete unit:", value);
      
      // First check if unit can be deleted
      const canDeleteResult = await productUnitsService.canDelete(value);
      
      if (!canDeleteResult.canDelete) {
        console.log("❌ Unit cannot be deleted:", canDeleteResult.reason);
        toast("Não é possível excluir a unidade", {
          description: canDeleteResult.reason || "Unidade está sendo usada."
        });
        return;
      }
      
      await productUnitsService.remove(value);
      
      setUnits(prev => prev.filter(u => u.value !== value));
      
      toast("Unidade excluída com sucesso");
    } catch (error: any) {
      console.error('❌ Error deleting unit:', error);
      toast("Erro ao excluir unidade", {
        description: error.message || "Houve um problema ao excluir a unidade."
      });
      throw error;
    }
  };

  // Reset to default units
  const resetToDefault = async () => {
    try {
      console.log("🔄 Resetting to default units");
      
      // Clear existing units
      for (const unit of units) {
        try {
          await productUnitsService.remove(unit.value);
        } catch (error) {
          console.warn(`Warning: Could not remove unit ${unit.value}:`, error);
        }
      }
      
      // Add default units
      await initializeDefaultUnits();
      
      toast("Unidades resetadas para o padrão");
    } catch (error) {
      console.error('❌ Error resetting units:', error);
      toast("Erro ao resetar unidades", {
        description: "Houve um problema ao resetar as unidades."
      });
      throw error;
    }
  };

  // Get related units (same base unit)
  const getRelatedUnits = (unit: string): Unit[] => {
    return converter.getRelatedUnits(unit);
  };

  // Refresh units from database
  const refreshUnits = async () => {
    await loadUnits();
  };

  // Load units on mount
  useEffect(() => {
    loadUnits();
  }, []);

  return {
    units,
    isLoading,
    defaultUnits: DEFAULT_UNITS,
    converter,
    addUnit,
    updateUnit,
    deleteUnit,
    resetToDefault,
    refreshUnits,
    getRelatedUnits
  };
};
