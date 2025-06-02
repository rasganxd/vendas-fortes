
import { useState, useEffect } from 'react';

interface UnitMapping {
  value: string;
  label: string;
}

export const useProductUnitsMapping = (productId?: string) => {
  const [productUnits, setProductUnits] = useState<UnitMapping[]>([]);
  const [mainUnit, setMainUnit] = useState<UnitMapping | null>(null);

  useEffect(() => {
    if (productId) {
      // Mock implementation - in real app this would fetch from database
      const mockUnits: UnitMapping[] = [
        { value: 'UN', label: 'Unidade' },
        { value: 'CX', label: 'Caixa' },
        { value: 'PCT', label: 'Pacote' }
      ];
      
      setProductUnits(mockUnits);
      setMainUnit(mockUnits[0]);
    } else {
      setProductUnits([]);
      setMainUnit(null);
    }
  }, [productId]);

  return { productUnits, mainUnit };
};
