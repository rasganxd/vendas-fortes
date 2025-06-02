
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
  const hasUnitsError = form.formState.errors.selectedUnits;
  const hasMainUnitError = form.formState.errors.mainUnitId;
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="selectedUnits"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Unidades do Produto
              <span className="text-red-500 text-sm font-normal">*</span>
              <span className="text-gray-500 text-sm font-normal">(obrigatório)</span>
            </FormLabel>
            {isLoadingUnits ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Carregando unidades do produto...
              </div>
            ) : (
              <>
                <ProductUnitsSelector 
                  selectedUnits={selectedUnits}
                  mainUnitId={mainUnitId}
                  onAddUnit={onAddUnit}
                  onRemoveUnit={onRemoveUnit}
                  onSetMainUnit={onSetMainUnit}
                  productPrice={productPrice}
                />
                {selectedUnits.length === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Atenção:</span> É obrigatório selecionar pelo menos uma unidade para o produto. 
                      Clique no botão "Adicionar" acima para escolher uma unidade.
                    </p>
                  </div>
                )}
                {selectedUnits.length > 0 && !mainUnitId && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Erro:</span> É obrigatório definir uma unidade principal. 
                      Clique em "Definir como principal" em uma das unidades acima.
                    </p>
                  </div>
                )}
              </>
            )}
            <FormMessage />
            {hasUnitsError && (
              <p className="text-sm font-medium text-red-600">
                {hasUnitsError.message}
              </p>
            )}
            {hasMainUnitError && (
              <p className="text-sm font-medium text-red-600">
                {hasMainUnitError.message}
              </p>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};
