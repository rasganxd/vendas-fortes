
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product, ProductBrand, ProductCategory, ProductGroup } from '@/types';
import { useProductFormLogic, ProductFormData } from './hooks/useProductFormLogic';
import { BasicFieldsSection } from './form/BasicFieldsSection';
import { ClassificationSection } from './form/ClassificationSection';
import { ProductUnitsSection } from './form/ProductUnitsSection';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  productBrands: ProductBrand[];
}

export default function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  isEditing,
  selectedProduct,
  products,
  productCategories,
  productGroups,
  productBrands
}: ProductFormProps) {
  const {
    form,
    units,
    isSubmitting,
    hasSubunit,
    selectedUnit,
    selectedSubunit,
    subunitRatio,
    isConversionValid,
    selectedUnits,
    mainUnitId,
    isLoadingUnits,
    addUnit,
    removeUnit,
    setAsMainUnit,
    handleSubmit
  } = useProductFormLogic({
    isEditing,
    selectedProduct,
    products,
    onSubmit
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Seção de Campos Básicos */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
              <BasicFieldsSection form={form} />
            </div>
            
            {/* Seção de Classificação */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Classificação</h3>
              <ClassificationSection 
                form={form}
                productCategories={productCategories}
                productGroups={productGroups}
                productBrands={productBrands}
              />
            </div>
            
            {/* Seção de Unidades */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Unidades de Medida</h3>
              <ProductUnitsSection 
                form={form}
                selectedUnits={selectedUnits}
                mainUnitId={mainUnitId}
                onAddUnit={addUnit}
                onRemoveUnit={removeUnit}
                onSetMainUnit={setAsMainUnit}
                productPrice={selectedProduct?.price || 0}
                isLoadingUnits={isLoadingUnits}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingUnits}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
