
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Unit } from '@/types/unit';
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
        const mainUnitData = allUnits.find(u => u.value === product.unit);
        productUnits.push({
          value: product.unit,
          label: product.unit,
          conversionRate: mainUnitData?.conversionRate || 1
        });
      }
      
      // Add subunit if exists
      if (product.hasSubunit && product.subunit) {
        const subunitData = allUnits.find(u => u.value === product.subunit);
        const conversionRate = subunitData?.conversionRate || 1;
        
        productUnits.push({
          value: product.subunit,
          label: `${product.subunit} (${conversionRate}x)`,
          conversionRate
        });
      }
      
      return productUnits;
    }
    
    // Fallback to generic units if no product specified
    return units;
  }, [product, units, allUnits]);

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unidade" />
      </SelectTrigger>
      <SelectContent>
        {availableUnits.map(unit => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label || unit.value}
            {unit.conversionRate && unit.conversionRate !== 1 && !unit.label?.includes('x') && (
              <span className="text-xs text-gray-500 ml-1">
                ({unit.conversionRate}x)
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
