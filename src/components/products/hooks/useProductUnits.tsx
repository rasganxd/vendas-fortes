
import { useState, useEffect } from 'react';
import { Unit as UnitType } from '@/services/supabase/unitService';
import { unitService } from '@/services/supabase/unitService';

// Legacy Unit interface for compatibility
interface Unit {
  value: string;
  label: string;
  conversionRate: number;
}

export const useProductUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading units for product form...");
      
      const dbUnits = await unitService.getAll();
      
      // Convert database units to the format expected by the product form
      const formattedUnits: Unit[] = dbUnits.map(unit => ({
        value: unit.code,
        label: `${unit.description} (${unit.code})`,
        conversionRate: 1 // Default conversion rate - can be enhanced later
      }));
      
      console.log("✅ Units loaded for product form:", formattedUnits.length, formattedUnits);
      setUnits(formattedUnits);
    } catch (error) {
      console.error('❌ Error loading units for product form:', error);
      // Fallback to empty array instead of default units
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

  const getRelatedUnits = (unit: string): Unit[] => {
    return units;
  };

  return {
    units,
    isLoading,
    defaultUnits: [], // No more default units
    converter: {
      convert: (quantity: number, fromUnit: string, toUnit: string) => quantity,
      calculateUnitPrice: (totalPrice: number, quantity: number) => totalPrice / quantity,
      getRelatedUnits
    },
    getRelatedUnits
  };
};
