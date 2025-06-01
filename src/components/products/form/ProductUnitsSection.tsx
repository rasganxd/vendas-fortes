
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';
import { ProductUnitsSelector } from './ProductUnitsSelector';

interface ProductUnitsSectionProps {
  form: UseFormReturn<ProductFormData>;
  selectedUnits: any[];
  mainUnitId: string | null;
  onAddUnit: (unit: any) => void;
  onRemoveUnit: (unitId: string) => void;
  onSetMainUnit: (unitId: string) => void;
  productPrice?: number;
}

export const ProductUnitsSection: React.FC<ProductUnitsSectionProps> = ({
  form,
  selectedUnits,
  mainUnitId,
  onAddUnit,
  onRemoveUnit,
  onSetMainUnit,
  productPrice = 0
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="selectedUnits"
        render={() => (
          <FormItem>
            <FormLabel>Unidades do Produto</FormLabel>
            <ProductUnitsSelector 
              selectedUnits={selectedUnits}
              mainUnitId={mainUnitId}
              onAddUnit={onAddUnit}
              onRemoveUnit={onRemoveUnit}
              onSetMainUnit={onSetMainUnit}
              productPrice={productPrice}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
