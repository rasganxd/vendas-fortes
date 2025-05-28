
import { useState, useEffect } from 'react';
import { Unit } from '@/types/unit';
import { UnitConverter } from '@/utils/unitConverter';
import { productUnitsService } from '@/services/supabase/productUnitsService';

const DEFAULT_UNITS: Unit[] = [
  { value: 'UN', label: 'Unidade (UN)', conversionRate: 1 },
  { value: 'KG', label: 'Quilograma (KG)', conversionRate: 1 },
  { value: 'L', label: 'Litro (L)', conversionRate: 1 },
  { value: 'ML', label: 'Mililitro (ML)', conversionRate: 0.001 },
  { value: 'CX', label: 'Caixa (CX)', conversionRate: 24 },
  { value: 'PCT', label: 'Pacote (PCT)', conversionRate: 12 },
  { value: 'PAR', label: 'Par (PAR)', conversionRate: 2 },
  { value: 'DUZIA', label: 'Dúzia (DZ)', conversionRate: 12 },
  { value: 'ROLO', label: 'Rolo (RL)', conversionRate: 1 },
  { value: 'METRO', label: 'Metro (M)', conversionRate: 1 }
];

export const useProductUnits = () => {
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar unidades do banco de dados
  const loadUnits = async () => {
    try {
      setIsLoading(true);
      const databaseUnits = await productUnitsService.getAll();
      setUnits(databaseUnits);
      
      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('unitsUpdated', { detail: databaseUnits }));
    } catch (error) {
      console.error('Erro ao carregar unidades, usando padrão:', error);
      setUnits(DEFAULT_UNITS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();

    // Escutar eventos de atualização de unidades
    const handleUnitsUpdated = (event: CustomEvent) => {
      setUnits(event.detail);
    };

    window.addEventListener('unitsUpdated', handleUnitsUpdated as EventListener);

    return () => {
      window.removeEventListener('unitsUpdated', handleUnitsUpdated as EventListener);
    };
  }, []);

  const converter = new UnitConverter(units);

  return {
    units,
    isLoading,
    defaultUnits: DEFAULT_UNITS,
    converter,
    refreshUnits: loadUnits,
    getRelatedUnits: (unit: string) => converter.getRelatedUnits(unit)
  };
};
