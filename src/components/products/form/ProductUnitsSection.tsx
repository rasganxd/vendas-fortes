
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';
import { ProductUnitsSelector } from './ProductUnitsSelector';
import { Loader2 } from 'lucide-react';

interface ProductUnitsSectionProps {
  form: UseFormReturn<ProductFormData>;
  selectedUnits: any[];
  mainUnitId: string | null;
  onAddUnit: (unit: any) => void;
  onRemoveUnit: (unitId: string) => void;
  onSetMainUnit: (unitId: string) => void;
  productPrice?: number;
  isLoadingUnits?: boolean;
}

export const ProductUnitsSection: React.FC<ProductUnitsSectionProps> = ({
  form,
  selectedUnits,
  mainUnitId,
  onAddUnit,
  onRemoveUnit,
  onSetMainUnit,
  productPrice = 0,
  isLoadingUnits = false
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="selectedUnits"
        render={() => (
          <FormItem>
            <FormLabel>Unidades do Produto</FormLabel>
            {isLoadingUnits ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Carregando unidades do produto...
              </div>
            ) : (
              <ProductUnitsSelector 
                selectedUnits={selectedUnits}
                mainUnitId={mainUnitId}
                onAddUnit={onAddUnit}
                onRemoveUnit={onRemoveUnit}
                onSetMainUnit={onSetMainUnit}
                productPrice={productPrice}
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
