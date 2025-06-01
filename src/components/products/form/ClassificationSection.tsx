
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductBrand, ProductCategory, ProductGroup } from '@/types';

interface ClassificationSectionProps {
  form: UseFormReturn<any>;
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
  // Filter out invalid items to prevent Select errors
  const validCategories = productCategories.filter(cat => cat && cat.id && cat.name && cat.name.trim() !== '');
  const validGroups = productGroups.filter(group => group && group.id && group.name && group.name.trim() !== '');
  const validBrands = productBrands.filter(brand => brand && brand.id && brand.name && brand.name.trim() !== '');

  console.log('🏷️ ClassificationSection - Valid data:', {
    categoriesCount: validCategories.length,
    groupsCount: validGroups.length,
    brandsCount: validBrands.length
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Categoria */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Nenhuma categoria</SelectItem>
                {validCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Grupo */}
      <FormField
        control={form.control}
        name="groupId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grupo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Nenhum grupo</SelectItem>
                {validGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Marca */}
      <FormField
        control={form.control}
        name="brandId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Nenhuma marca</SelectItem>
                {validBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
