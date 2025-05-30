
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
          <DialogTitle>
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicFieldsSection form={form} units={units} />
            
            <ClassificationSection 
              form={form}
              productCategories={productCategories}
              productGroups={productGroups}
              productBrands={productBrands}
            />
            
            <ProductUnitsSection 
              form={form}
              productId={selectedProduct?.id}
              productPrice={selectedProduct?.price}
              isEditing={isEditing}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
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
