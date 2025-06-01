
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product, ProductBrand, ProductCategory, ProductGroup } from '@/types';
import { useProductUnitsMapping } from '@/hooks/useProductUnitsMapping';
import { BasicFieldsSection } from './form/BasicFieldsSection';
import { ClassificationSection } from './form/ClassificationSection';
import { ProductUnitsSection } from './form/ProductUnitsSection';
import { useSimplifiedProductFormLogic, SimplifiedProductFormData } from './hooks/useSimplifiedProductFormLogic';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SimplifiedProductFormData) => Promise<void>;
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
  // Load existing units when editing
  const {
    productUnits: existingUnits,
    mainUnit: existingMainUnit,
    isLoading: loadingUnits
  } = useProductUnitsMapping(isEditing ? selectedProduct?.id : undefined);

  console.log("🎭 ProductForm - Estado:", {
    open,
    isEditing,
    selectedProduct: selectedProduct?.name,
    selectedProductId: selectedProduct?.id,
    existingUnitsCount: existingUnits.length,
    existingMainUnit: existingMainUnit?.value,
    loadingUnits
  });

  const {
    form,
    allUnits,
    isSubmitting,
    isInitialized,
    unitsLoading,
    primaryUnit,
    secondaryUnits,
    handlePrimaryUnitChange,
    handleAddSecondaryUnit,
    handleRemoveSecondaryUnit,
    handleSubmit
  } = useSimplifiedProductFormLogic({
    isEditing,
    selectedProduct,
    products,
    onSubmit,
    existingUnits,
    existingMainUnit
  });

  // Show units section when ready
  const showUnitsSection = !isEditing || (isEditing && isInitialized && !loadingUnits);
  const isFormReady = isInitialized && !unitsLoading && !loadingUnits;

  console.log("👁️ ProductForm - Renderização:", {
    showUnitsSection,
    isInitialized,
    loadingUnits,
    unitsLoading,
    isFormReady,
    primaryUnit: primaryUnit?.value,
    secondaryUnitsCount: secondaryUnits.length
  });

  // Helper function to convert "none" values to empty strings or null
  const sanitizeFormValue = (value: string | undefined | null) => {
    if (!value || value === "none") return null;
    return value;
  };

  // Custom submit handler to sanitize values
  const handleFormSubmit = (data: any) => {
    const sanitizedData = {
      ...data,
      categoryId: sanitizeFormValue(data.categoryId),
      groupId: sanitizeFormValue(data.groupId),
      brandId: sanitizeFormValue(data.brandId)
    };
    handleSubmit(sanitizedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isEditing ? `Editar Produto: ${selectedProduct?.name}` : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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
                productCategories={productCategories.filter(cat => cat.name && cat.name.trim() !== '')} 
                productGroups={productGroups.filter(group => group.name && group.name.trim() !== '')} 
                productBrands={productBrands.filter(brand => brand.name && brand.name.trim() !== '')} 
              />
            </div>
            
            {/* Seção de Unidades */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Unidades de Medida</h3>
              {showUnitsSection ? (
                <ProductUnitsSection
                  form={form}
                  availableUnits={allUnits}
                  primaryUnit={primaryUnit}
                  secondaryUnits={secondaryUnits}
                  onPrimaryUnitChange={handlePrimaryUnitChange}
                  onAddSecondaryUnit={handleAddSecondaryUnit}
                  onRemoveSecondaryUnit={handleRemoveSecondaryUnit}
                  isLoading={unitsLoading}
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">
                    {loadingUnits ? "Carregando unidades do produto..." : "Inicializando formulário..."}
                  </span>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log('❌ Form cancelled by user');
                  onOpenChange(false);
                }} 
                disabled={isSubmitting}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isFormReady || !primaryUnit}
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
