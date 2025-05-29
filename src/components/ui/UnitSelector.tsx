
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
          packageQuantity: 1
        });
      }
      
      // Add subunit if exists
      if (product.hasSubunit && product.subunit && product.subunitRatio) {
        // Calculate price per subunit using the product's subunitRatio
        const pricePerSubunit = product.price / product.subunitRatio;
        
        productUnits.push({
          value: product.subunit,
          label: `${product.subunit} (R$ ${pricePerSubunit.toFixed(2).replace('.', ',')})`,
          packageQuantity: product.subunitRatio
        });
      }
      
      return productUnits;
    }
    
    // Fallback to generic units if no product specified
    return units;
  }, [product, units]);

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unidade" />
      </SelectTrigger>
      <SelectContent className="z-[9999] bg-white">
        {availableUnits.map(unit => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label || unit.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
