
import { useState, useEffect } from 'react';

interface Unit {
  value: string;
  label: string;
}

const DEFAULT_UNITS: Unit[] = [
  { value: 'UN', label: 'Unidade (UN)' },
  { value: 'KG', label: 'Quilograma (KG)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ML', label: 'Mililitro (ML)' },
  { value: 'CX', label: 'Caixa (CX)' },
  { value: 'PCT', label: 'Pacote (PCT)' },
  { value: 'PAR', label: 'Par (PAR)' },
  { value: 'DUZIA', label: 'Dúzia (DZ)' },
  { value: 'ROLO', label: 'Rolo (RL)' },
  { value: 'METRO', label: 'Metro (M)' }
];

const STORAGE_KEY = 'product_units';

export const useProductUnits = () => {
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);

  useEffect(() => {
    // Carregar unidades do localStorage
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

    // Escutar mudanças nas unidades
    const handleUnitsUpdated = (event: CustomEvent) => {
      setUnits(event.detail);
    };

    window.addEventListener('unitsUpdated', handleUnitsUpdated as EventListener);

    return () => {
      window.removeEventListener('unitsUpdated', handleUnitsUpdated as EventListener);
    };
  }, []);

  return {
    units,
    defaultUnits: DEFAULT_UNITS
  };
};
