
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';
import { Percent, Info } from 'lucide-react';

interface DiscountSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export const DiscountSection: React.FC<DiscountSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Controle de Desconto</h3>
      </div>

      <FormField
        control={form.control}
        name="maxDiscountPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desconto Máximo Permitido (%)</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type="number" 
                  placeholder="Ex: 15 (para 15%)" 
                  min="0"
                  max="100"
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  value={field.value || ''}
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Como funciona o controle de desconto</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Define o desconto máximo que pode ser aplicado sobre o preço de venda</li>
              <li>• Durante a venda, o sistema validará se o preço não excede o desconto permitido</li>
              <li>• Deixe em branco para não aplicar limite de desconto</li>
              <li>• Exemplo: 15% permite vender com até 15% de desconto do preço original</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
