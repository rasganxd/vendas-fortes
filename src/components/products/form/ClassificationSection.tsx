
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';

interface ClassificationSectionProps {
  form: UseFormReturn<ProductFormData>;
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
  const hasCategories = Array.isArray(productCategories) && productCategories.length > 0;
  const hasGroups = Array.isArray(productGroups) && productGroups.length > 0;
  const hasBrands = Array.isArray(productBrands) && productBrands.length > 0;
  const isLoadingClassifications = productCategories === undefined || productGroups === undefined || productBrands === undefined;

  return (
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <FormControl>
              {isLoadingClassifications ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {hasCategories ? (
                      productCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>Nenhuma categoria cadastrada</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
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
              {isLoadingClassifications ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {hasGroups ? (
                      productGroups.map(group => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-groups" disabled>Nenhum grupo cadastrado</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
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
              {isLoadingClassifications ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {hasBrands ? (
                      productBrands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-brands" disabled>Nenhuma marca cadastrada</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
