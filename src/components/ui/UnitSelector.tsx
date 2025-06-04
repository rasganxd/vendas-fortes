
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Unit } from '@/services/supabase/unitService';
import { Product } from '@/types/product';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';

interface UnitSelectorProps {
  units?: Unit[];
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  product?: Product;
  className?: string;
}

export default function UnitSelector({
  units = [],
  selectedUnit,
  onUnitChange,
  product,
  className
}: UnitSelectorProps) {
  const { units: allUnits } = useProductUnits();
  
  // If product is provided, show only product-specific units
  const availableUnits = React.useMemo(() => {
    if (product) {
      const productUnits = [];
      
      // Always add main unit
      if (product.unit) {
        const mainUnitData = allUnits.find(u => u.code === product.unit);
        productUnits.push({
          code: product.unit,
          description: mainUnitData?.description || product.unit,
          packageQuantity: 1 // Main unit is always 1
        });
      }
      
      // Add subunit if exists (without price display)
      if (product.hasSubunit && product.subunit) {
        const subUnitData = allUnits.find(u => u.code === product.subunit);
        
        productUnits.push({
          code: product.subunit,
          description: subUnitData?.description || product.subunit,
          packageQuantity: 1
        });
      }
      
      return productUnits;
    }
    
    // Fallback to generic units if no product specified
    return units.map(unit => ({
      code: unit.code,
      description: unit.description,
      packageQuantity: unit.package_quantity || 1
    }));
  }, [product, units, allUnits]);

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unidade" />
      </SelectTrigger>
      <SelectContent>
        {availableUnits.map(unit => (
          <SelectItem key={unit.code} value={unit.code}>
            {unit.description || unit.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
