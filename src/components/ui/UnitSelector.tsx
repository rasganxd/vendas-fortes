
import React from 'react';
import { Product } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitSelectorProps {
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  product?: Product;
  className?: string;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({
  selectedUnit,
  onUnitChange,
  product,
  className = ''
}) => {
  const units = [
    { value: 'UN', label: 'Unidade' },
    { value: 'CX', label: 'Caixa' },
    { value: 'PCT', label: 'Pacote' },
    { value: 'KG', label: 'Quilograma' },
    { value: 'L', label: 'Litro' }
  ];

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecione a unidade" />
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UnitSelector;
