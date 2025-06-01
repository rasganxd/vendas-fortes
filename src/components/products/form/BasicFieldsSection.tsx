
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { formatCurrency } from "@/lib/utils";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';

interface BasicFieldsSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export const BasicFieldsSection: React.FC<BasicFieldsSectionProps> = ({
  form
}) => {
  return (
    <div className="space-y-6">
      {/* Código e Nome */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          control={form.control} 
          name="code" 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Código</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Código do produto" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="name" 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Nome do Produto</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do produto" 
                  {...field} 
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
      </div>

      {/* Preço de Custo e Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          control={form.control} 
          name="cost" 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Preço de Custo</FormLabel>
              <FormControl>
                <Input 
                  mask="price"
                  placeholder="0,00" 
                  value={formatCurrency(field.value)} 
                  onChange={e => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    field.onChange(parseFloat(numericValue) / 100 || 0);
                  }}
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="stock" 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Estoque Inicial</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Quantidade em estoque" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
      </div>
    </div>
  );
};
