
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { ProductUnit } from '@/types/productUnits';
import { Crown } from 'lucide-react';

interface PrimaryUnitSelectorProps {
  form: UseFormReturn<any>;
  availableUnits: ProductUnit[];
  selectedPrimaryUnit: ProductUnit | null;
  onPrimaryUnitChange: (unit: ProductUnit | null) => void;
  isLoading?: boolean;
}

export const PrimaryUnitSelector: React.FC<PrimaryUnitSelectorProps> = ({
  form,
  availableUnits,
  selectedPrimaryUnit,
  onPrimaryUnitChange,
  isLoading = false
}) => {
  console.log("🎯 PrimaryUnitSelector:", {
    availableUnits: availableUnits.length,
    selectedPrimaryUnit: selectedPrimaryUnit?.value,
    isLoading
  });

  const handleUnitChange = (unitId: string) => {
    const unit = availableUnits.find(u => u.id === unitId);
    console.log("👑 Selecting primary unit:", { unitId, unit });
    onPrimaryUnitChange(unit || null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="h-4 w-4 text-yellow-500" />
        <h4 className="text-sm font-medium">Unidade Principal</h4>
      </div>
      
      <FormField
        control={form.control}
        name="primaryUnitId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecione a unidade principal do produto</FormLabel>
            <FormControl>
              <Select
                value={selectedPrimaryUnit?.id || ""}
                onValueChange={handleUnitChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a unidade principal" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{unit.value}</span>
                        <span className="text-sm text-muted-foreground">
                          {unit.label} ({unit.packageQuantity} unidades)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedPrimaryUnit && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Unidade Principal: {selectedPrimaryUnit.value} - {selectedPrimaryUnit.label}
            </span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            Esta será a unidade base para precificação e conversões
          </p>
        </div>
      )}
    </div>
  );
};
