
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from '@/types/product';
import { useUnifiedProductUnits } from '@/hooks/useUnifiedProductUnits';

interface UnifiedUnitSelectorProps {
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  product?: Product;
  className?: string;
}

export default function UnifiedUnitSelector({
  selectedUnit,
  onUnitChange,
  product,
  className
}: UnifiedUnitSelectorProps) {
  const { units, isLoading } = useUnifiedProductUnits(product || null);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unidade" />
      </SelectTrigger>
      <SelectContent className="z-[9999] bg-white">
        {units.map(unit => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
