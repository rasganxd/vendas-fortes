
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Unit } from '@/types/unit';

interface UnitSelectorProps {
  units: Unit[];
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  productUnit?: string;
  className?: string;
}

export default function UnitSelector({
  units,
  selectedUnit,
  onUnitChange,
  productUnit,
  className
}: UnitSelectorProps) {
  // Filtrar unidades relacionadas ao produto se especificado
  const availableUnits = productUnit 
    ? units.filter(unit => 
        unit.value === productUnit || 
        unit.baseUnit === productUnit || 
        (units.find(u => u.value === productUnit)?.baseUnit === unit.baseUnit)
      )
    : units;

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unidade" />
      </SelectTrigger>
      <SelectContent>
        {availableUnits.map(unit => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.value}
            {unit.conversionRate && unit.conversionRate !== 1 && (
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
