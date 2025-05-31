
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { ProductBrand, ProductCategory, ProductGroup } from '@/types';
import { SimplifiedProductFormData } from '../hooks/useSimplifiedProductFormLogic';

interface ClassificationSectionProps {
  form: UseFormReturn<SimplifiedProductFormData>;
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  productBrands: ProductBrand[];
}

export const ClassificationSection: React.FC<ClassificationSectionProps> = ({
  form,
  productCategories,
  productGroups,
  productBrands
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <FormControl>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma categoria</SelectItem>
                  {productCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="groupId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grupo</FormLabel>
            <FormControl>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum grupo</SelectItem>
                  {productGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="brandId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <FormControl>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma marca</SelectItem>
                  {productBrands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
