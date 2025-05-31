
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductUnit } from '@/types/productUnits';
import { UnitsManagementSection } from './UnitsManagementSection';
import { Loader2 } from 'lucide-react';
import { SimplifiedProductFormData } from '../hooks/useSimplifiedProductFormLogic';

interface ProductUnitsSectionProps {
  form: UseFormReturn<SimplifiedProductFormData>;
  availableUnits: ProductUnit[];
  primaryUnit: ProductUnit | null;
  secondaryUnits: ProductUnit[];
  onPrimaryUnitChange: (unit: ProductUnit | null) => void;
  onAddSecondaryUnit: (unit: ProductUnit) => void;
  onRemoveSecondaryUnit: (unitId: string) => void;
  isLoading?: boolean;
}

export const ProductUnitsSection: React.FC<ProductUnitsSectionProps> = ({
  form,
  availableUnits,
  primaryUnit,
  secondaryUnits,
  onPrimaryUnitChange,
  onAddSecondaryUnit,
  onRemoveSecondaryUnit,
  isLoading = false
}) => {
  console.log("📦 ProductUnitsSection:", {
    availableUnits: availableUnits.length,
    primaryUnit: primaryUnit?.value,
    secondaryUnits: secondaryUnits.length,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm text-gray-500">Carregando unidades...</span>
      </div>
    );
  }

  return (
    <UnitsManagementSection
      form={form}
      availableUnits={availableUnits}
      primaryUnit={primaryUnit}
      secondaryUnits={secondaryUnits}
      onPrimaryUnitChange={onPrimaryUnitChange}
      onAddSecondaryUnit={onAddSecondaryUnit}
      onRemoveSecondaryUnit={onRemoveSecondaryUnit}
      isLoading={isLoading}
    />
  );
};
