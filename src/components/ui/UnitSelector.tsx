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
  
  const availableUnits = React.useMemo(() => {
    if (product) {
      const productUnits = [];

      // Unidade principal
      if (product.unit) {
        const mainUnitData = allUnits.find(u => u.code === product.unit);
        if (mainUnitData) {
          productUnits.push({
            code: product.unit,
            description: mainUnitData.description || product.unit,
            packageQuantity: mainUnitData.package_quantity || 1
          });
        }
      }

      // Subunidade (se existir)
      if (product.hasSubunit && product.subunit) {
        const subUnitData = allUnits.find(u => u.code === product.subunit);
        if (subUnitData) {
          productUnits.push({
            code: product.subunit,
            description: subUnitData.description || product.subunit,
            packageQuantity: subUnitData.package_quantity || 1
          });
        }
      }

      return productUnits;
    }

    // Fallback genérico se não houver produto
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
