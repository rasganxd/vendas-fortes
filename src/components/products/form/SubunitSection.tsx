
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';
import { Unit } from '@/types/unit';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../hooks/useProductFormLogic';

interface SubunitSectionProps {
  form: UseFormReturn<ProductFormData>;
  units: Unit[];
  hasSubunit: boolean;
  selectedUnit: string;
  selectedSubunit: string;
  subunitRatio: number | null;
  isConversionValid: boolean;
}

export const SubunitSection: React.FC<SubunitSectionProps> = ({
  form,
  units,
  hasSubunit,
  selectedUnit,
  selectedSubunit,
  subunitRatio,
  isConversionValid
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <FormField
        control={form.control}
        name="hasSubunit"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Este produto tem sub-unidade?
              </FormLabel>
              <p className="text-sm text-gray-600">
                Ex: Produto vendido em caixas que contêm unidades menores
              </p>
            </div>
          </FormItem>
        )}
      />

      {hasSubunit && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="subunit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-unidade</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a sub-unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedUnit && selectedSubunit && (
            <div className="space-y-3">
              {isConversionValid ? (
                <div className="text-sm text-gray-700 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="font-medium text-blue-800">Conversão Calculada:</p>
                  <p className="text-blue-700">
                    1 {selectedUnit} contém {subunitRatio} {selectedSubunit}
                  </p>
                  <p className="text-xs mt-1 text-blue-600">
                    Baseado nas quantidades: {selectedUnit} ({units.find(u => u.value === selectedUnit)?.packageQuantity}) ÷ {selectedSubunit} ({units.find(u => u.value === selectedSubunit)?.packageQuantity})
                  </p>
                </div>
              ) : (
                <div className="text-sm text-red-700 p-3 bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Configuração Inválida</p>
                      <p className="text-red-700">
                        A sub-unidade ({selectedSubunit}: {units.find(u => u.value === selectedSubunit)?.packageQuantity}) não pode ter mais itens que a unidade principal ({selectedUnit}: {units.find(u => u.value === selectedUnit)?.packageQuantity})
                      </p>
                      <p className="text-xs mt-1 text-red-600">
                        Ajuste as quantidades das unidades em Configurações → Unidades
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
