
import React, { useEffect } from 'react';
import {
  Form,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { Product, ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { useProductFormLogic, ProductFormData } from './hooks/useProductFormLogic';
import { BasicFieldsSection } from './form/BasicFieldsSection';
import { SubunitSection } from './form/SubunitSection';
import { ClassificationSection } from './form/ClassificationSection';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  productBrands: ProductBrand[];
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  isEditing,
  selectedProduct,
  products,
  productCategories,
  productGroups,
  productBrands,
  onSubmit
}) => {
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
  
  // Add debug logging for classification data
  useEffect(() => {
    console.log("ProductForm received productCategories:", productCategories?.length || 0, "items");
    console.log("ProductForm received productGroups:", productGroups?.length || 0, "items");
    console.log("ProductForm received productBrands:", productBrands?.length || 0, "items");
    
    if (productGroups?.length === 0) {
      console.log("No product groups received");
    } else {
      console.log("First few product groups:", productGroups?.slice(0, 3));
    }
    
    if (productBrands?.length === 0) {
      console.log("No product brands received");
    } else {
      console.log("First few product brands:", productBrands?.slice(0, 3));
    }
  }, [productCategories, productGroups, productBrands]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Produto</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os dados do produto abaixo" : "Preencha os dados do novo produto abaixo"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicFieldsSection form={form} units={units} />
            
            <SubunitSection 
              form={form}
              units={units}
              hasSubunit={hasSubunit}
              selectedUnit={selectedUnit}
              selectedSubunit={selectedSubunit}
              subunitRatio={subunitRatio}
              isConversionValid={isConversionValid}
            />
            
            <ClassificationSection 
              form={form}
              productCategories={productCategories}
              productGroups={productGroups}
              productBrands={productBrands}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || (hasSubunit && !isConversionValid)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
