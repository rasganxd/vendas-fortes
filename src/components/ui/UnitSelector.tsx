
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
import { useProductUnitsMapping } from '@/hooks/useProductUnitsMapping';

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
  const { productUnits, mainUnit } = useProductUnitsMapping(product?.id);
  
  // If product is provided, show product-specific units from mapping
  const availableUnits = React.useMemo(() => {
    if (product && productUnits.length > 0) {
      console.log('🎯 Usando unidades do mapeamento para produto:', product.name, productUnits);
      
      return productUnits.map(unit => ({
        value: unit.value,
        label: unit.label,
        packageQuantity: unit.packageQuantity
      }));
    }
    
    // Fallback para unidades legacy do produto
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
        const pricePerSubunit = product.price / product.subunitRatio;
        
        productUnits.push({
          value: product.subunit,
          label: `${product.subunit} (R$ ${pricePerSubunit.toFixed(2).replace('.', ',')})`,
          packageQuantity: product.subunitRatio
        });
      }
      
      console.log('📦 Usando unidades legacy para produto:', product.name, productUnits);
      return productUnits;
    }
    
    // Fallback to generic units if no product specified
    console.log('🔧 Usando unidades genéricas');
    return units;
  }, [product, productUnits, units]);

  // Auto-select main unit if no unit is selected and we have a main unit
  React.useEffect(() => {
    if (product && !selectedUnit && mainUnit) {
      console.log('🎯 Auto-selecionando unidade principal:', mainUnit.value);
      onUnitChange(mainUnit.value);
    }
  }, [product, selectedUnit, mainUnit, onUnitChange]);

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
