
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductUnit } from '@/types/productUnits';
import { PrimaryUnitSelector } from './PrimaryUnitSelector';
import { SecondaryUnitsManager } from './SecondaryUnitsManager';

interface UnitsManagementSectionProps {
  form: UseFormReturn<any>;
  availableUnits: ProductUnit[];
  primaryUnit: ProductUnit | null;
  secondaryUnits: ProductUnit[];
  onPrimaryUnitChange: (unit: ProductUnit | null) => void;
  onAddSecondaryUnit: (unit: ProductUnit) => void;
  onRemoveSecondaryUnit: (unitId: string) => void;
  isLoading?: boolean;
}

export const UnitsManagementSection: React.FC<UnitsManagementSectionProps> = ({
  form,
  availableUnits,
  primaryUnit,
  secondaryUnits,
  onPrimaryUnitChange,
  onAddSecondaryUnit,
  onRemoveSecondaryUnit,
  isLoading = false
}) => {
  console.log("🏗️ UnitsManagementSection:", {
    availableUnits: availableUnits.length,
    primaryUnit: primaryUnit?.value,
    secondaryUnits: secondaryUnits.length,
    isLoading
  });

  return (
    <div className="space-y-6">
      {/* Seletor de Unidade Principal */}
      <PrimaryUnitSelector
        form={form}
        availableUnits={availableUnits}
        selectedPrimaryUnit={primaryUnit}
        onPrimaryUnitChange={onPrimaryUnitChange}
        isLoading={isLoading}
      />

      {/* Gerenciador de Unidades Secundárias */}
      <SecondaryUnitsManager
        primaryUnit={primaryUnit}
        secondaryUnits={secondaryUnits}
        availableUnits={availableUnits}
        onAddSecondaryUnit={onAddSecondaryUnit}
        onRemoveSecondaryUnit={onRemoveSecondaryUnit}
        isLoading={isLoading}
      />
    </div>
  );
};
