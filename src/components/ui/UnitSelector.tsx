
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
        productUnits.push({
          value: product.unit,
          label: product.unit,
          conversionRate: 1 // Main unit is always 1
        });
      }
      
      // Add subunit if exists
      if (product.hasSubunit && product.subunit) {
        // Get the main unit's conversion rate to calculate subunit price display
        const mainUnitData = allUnits.find(u => u.value === product.unit);
        const mainUnitConversionRate = mainUnitData?.conversionRate || 1;
        
        // Calculate price per subunit for display
        const pricePerSubunit = product.price / mainUnitConversionRate;
        
        productUnits.push({
          value: product.subunit,
          label: `${product.subunit} (${pricePerSubunit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
          conversionRate: mainUnitConversionRate
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
      <SelectContent className="z-[9999]">
        {availableUnits.map(unit => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label || unit.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
