
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';
import { ProductUnitsSelector } from './ProductUnitsSelector';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const hasAnyError = hasUnitsError || hasMainUnitError;
  
  const getStatusInfo = () => {
    if (selectedUnits.length === 0) {
      return {
        type: 'error',
        title: 'Unidades obrigatórias',
        message: 'É obrigatório selecionar pelo menos uma unidade para o produto. Clique no botão "Adicionar" abaixo para escolher uma unidade.',
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    
    if (selectedUnits.length > 0 && !mainUnitId) {
      return {
        type: 'error',
        title: 'Unidade principal obrigatória',
        message: 'É obrigatório definir uma unidade principal. Clique em "Definir como principal" em uma das unidades abaixo.',
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    
    return {
      type: 'success',
      title: 'Configuração válida',
      message: `${selectedUnits.length} unidade(s) configurada(s) com sucesso. Unidade principal definida.`,
      icon: <CheckCircle className="h-4 w-4" />
    };
  };
  
  const statusInfo = getStatusInfo();
  
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
              <div className="flex items-center justify-center p-8 text-gray-500 border rounded-md bg-gray-50">
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
                
                {/* Status da configuração */}
                <Alert className={
                  statusInfo.type === 'error' 
                    ? "border-red-200 bg-red-50" 
                    : "border-green-200 bg-green-50"
                }>
                  <div className="flex items-start gap-2">
                    <div className={statusInfo.type === 'error' ? "text-red-600" : "text-green-600"}>
                      {statusInfo.icon}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${statusInfo.type === 'error' ? "text-red-800" : "text-green-800"}`}>
                        {statusInfo.title}
                      </div>
                      <AlertDescription className={statusInfo.type === 'error' ? "text-red-700" : "text-green-700"}>
                        {statusInfo.message}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
                
                {/* Mensagens de erro do formulário */}
                <FormMessage />
                {hasUnitsError && (
                  <p className="text-sm font-medium text-red-600 mt-1">
                    {hasUnitsError.message}
                  </p>
                )}
                {hasMainUnitError && (
                  <p className="text-sm font-medium text-red-600 mt-1">
                    {hasMainUnitError.message}
                  </p>
                )}
              </>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};
