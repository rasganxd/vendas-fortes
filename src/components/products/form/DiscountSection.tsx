
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';

interface DiscountSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export const DiscountSection: React.FC<DiscountSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configurações de Desconto</h3>
      <p className="text-sm text-muted-foreground">
        As configurações de desconto podem ser definidas na seção de Precificação após salvar o produto.
      </p>
    </div>
  );
};
