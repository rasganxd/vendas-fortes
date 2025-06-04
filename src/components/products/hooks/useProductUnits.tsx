import { useState, useEffect } from 'react';
import { Unit as UnitType } from '@/services/supabase/unitService';
import { unitService } from '@/services/supabase/unitService';
import { UnitConverter } from '@/utils/UnitConverter';

export const useProductUnits = () => {
  const [units, setUnits] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [converterInstance, setConverter] = useState<UnitConverter | null>(null);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading units for product form...");
      
      const dbUnits = await unitService.getAll();
      
      console.log("✅ Units loaded for product form:", dbUnits.length, dbUnits);
      setUnits(dbUnits);
      setConverter(new UnitConverter(dbUnits));
    } catch (error) {
      console.error('❌ Error loading units for product form:', error);
      setUnits([]);
      setConverter(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();

    const handleUnitsUpdated = () => {
      console.log("🔄 Units updated event received, reloading...");
      loadUnits();
    };

    window.addEventListener('unitsUpdated', handleUnitsUpdated);

    return () => {
      window.removeEventListener('unitsUpdated', handleUnitsUpdated);
    };
  }, []);

  const getRelatedUnits = (unit: string): UnitType[] => {
    return units;
  };

  return {
    units,
    isLoading,
    converter: converterInstance ?? {
      convert: (quantity: number, fromUnit: string, toUnit: string) => quantity,
      calculateUnitPrice: (totalPrice: number, quantity: number, unit: string, baseUnit: string) => totalPrice / quantity,
      getRelatedUnits
    },
    getRelatedUnits
  };
};
