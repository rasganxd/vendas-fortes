
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';
import { ProductUnitsManager } from '../ProductUnitsManager';

interface ProductUnitsSectionProps {
  form: UseFormReturn<ProductFormData>;
  productId?: string;
  productPrice?: number;
  isEditing: boolean;
}

export const ProductUnitsSection: React.FC<ProductUnitsSectionProps> = ({
  form,
  productId,
  productPrice = 0,
  isEditing
}) => {
  if (!isEditing || !productId) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-muted-foreground">
          As unidades podem ser configuradas após salvar o produto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="hasSubunit"
        render={() => (
          <FormItem>
            <FormLabel>Unidades do Produto</FormLabel>
            <ProductUnitsManager 
              productId={productId}
              productPrice={productPrice}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
