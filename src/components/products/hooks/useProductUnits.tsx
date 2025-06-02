
import { useState, useEffect } from 'react';
import { Unit } from '@/types/unit';
import { UnitConverter } from '@/utils/unitConverter';

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

const STORAGE_KEY = 'product_units';

export const useProductUnits = () => {
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);

  useEffect(() => {
    const savedUnits = localStorage.getItem(STORAGE_KEY);
    if (savedUnits) {
      try {
        const parsedUnits = JSON.parse(savedUnits);
        setUnits(parsedUnits);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        setUnits(DEFAULT_UNITS);
      }
    }

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
    defaultUnits: DEFAULT_UNITS,
    converter,
    getRelatedUnits: (unit: string) => converter.getRelatedUnits(unit)
  };
};
