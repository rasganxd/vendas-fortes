
import { useState, useEffect } from 'react';
import { Unit as UnitType } from '@/services/supabase/unitService';
import { unitService } from '@/services/supabase/unitService';

export const useProductUnits = () => {
  const [units, setUnits] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading units for product form...");
      
      const dbUnits = await unitService.getAll();
      
      console.log("✅ Units loaded for product form:", dbUnits.length, dbUnits);
      setUnits(dbUnits);
    } catch (error) {
      console.error('❌ Error loading units for product form:', error);
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();

    // Listen for unit updates from other components
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
    converter: {
      convert: (quantity: number, fromUnit: string, toUnit: string) => quantity,
      calculateUnitPrice: (totalPrice: number, quantity: number) => totalPrice / quantity,
      getRelatedUnits
    },
    getRelatedUnits
  };
};
