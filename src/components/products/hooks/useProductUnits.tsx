
import { useState, useEffect } from 'react';
import { Unit } from '@/types/unit';
import { UnitConverter } from '@/utils/unitConverter';
import { toast } from 'sonner';
import { productUnitsService } from '@/services/supabase/productUnitsService';

const DEFAULT_UNITS: Unit[] = [
  { value: 'UN', label: 'Unidade', conversionRate: 1 },
  { value: 'KG', label: 'Quilograma', conversionRate: 1 },
  { value: 'LT', label: 'Litro', conversionRate: 1 },
  { value: 'MT', label: 'Metro', conversionRate: 1 },
  { value: 'CX', label: 'Caixa', conversionRate: 1 },
  { value: 'PC', label: 'Peça', conversionRate: 1 },
  { value: 'M2', label: 'Metro Quadrado', conversionRate: 1 },
  { value: 'M3', label: 'Metro Cúbico', conversionRate: 1 },
  { value: 'DZ', label: 'Dúzia', conversionRate: 12 },
  { value: 'GR', label: 'Grama', conversionRate: 0.001 },
];

export const useProductUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [converter] = useState(new UnitConverter());

  // Load units from database or use defaults
  const loadUnits = async () => {
    try {
      setIsLoading(true);
      console.log("Loading units from database...");
      
      const dbUnits = await productUnitsService.getAll();
      
      if (dbUnits.length === 0) {
        console.log("No units found in DB, initializing with defaults");
        await initializeDefaultUnits();
      } else {
        console.log(`Loaded ${dbUnits.length} units from database:`, dbUnits);
        setUnits(dbUnits);
      }
    } catch (error) {
      console.error('Error loading units:', error);
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
      console.log("Initializing default units in database");
      
      for (const unit of DEFAULT_UNITS) {
        await productUnitsService.add(unit);
      }
      
      const dbUnits = await productUnitsService.getAll();
      setUnits(dbUnits);
      
      toast("Unidades padrão inicializadas");
    } catch (error) {
      console.error('Error initializing default units:', error);
      setUnits(DEFAULT_UNITS);
    }
  };

  // Add a new unit
  const addUnit = async (unit: Omit<Unit, 'id'>) => {
    try {
      console.log("Adding new unit:", unit);
      const id = await productUnitsService.add(unit);
      const newUnit = { ...unit, id } as Unit;
      
      setUnits(prev => [...prev, newUnit]);
      
      toast("Unidade adicionada com sucesso");
      return id;
    } catch (error) {
      console.error('Error adding unit:', error);
      toast("Erro ao adicionar unidade", {
        description: "Houve um problema ao adicionar a unidade."
      });
      throw error;
    }
  };

  // Update an existing unit
  const updateUnit = async (value: string, updates: Partial<Unit>) => {
    try {
      console.log("Updating unit:", value, updates);
      
      await productUnitsService.update(value, updates);
      
      setUnits(prev => prev.map(u => 
        u.value === value ? { ...u, ...updates } : u
      ));
      
      toast("Unidade atualizada com sucesso");
    } catch (error) {
      console.error('Error updating unit:', error);
      toast("Erro ao atualizar unidade", {
        description: "Houve um problema ao atualizar a unidade."
      });
      throw error;
    }
  };

  // Delete a unit
  const deleteUnit = async (value: string) => {
    try {
      console.log("Deleting unit:", value);
      
      await productUnitsService.remove(value);
      
      setUnits(prev => prev.filter(u => u.value !== value));
      
      toast("Unidade excluída com sucesso");
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast("Erro ao excluir unidade", {
        description: "Houve um problema ao excluir a unidade."
      });
      throw error;
    }
  };

  // Reset to default units
  const resetToDefault = async () => {
    try {
      console.log("Resetting to default units");
      
      // Clear existing units
      for (const unit of units) {
        await productUnitsService.remove(unit.value);
      }
      
      // Add default units
      await initializeDefaultUnits();
      
      toast("Unidades resetadas para o padrão");
    } catch (error) {
      console.error('Error resetting units:', error);
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
