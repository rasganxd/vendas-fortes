
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductUnit } from '@/types/productUnits';

interface SecondaryUnitsManagerProps {
  primaryUnit: ProductUnit | null;
  secondaryUnits: ProductUnit[];
  availableUnits: ProductUnit[];
  onAddSecondaryUnit: (unit: ProductUnit) => void;
  onRemoveSecondaryUnit: (unitId: string) => void;
  isLoading?: boolean;
}

export const SecondaryUnitsManager: React.FC<SecondaryUnitsManagerProps> = ({
  primaryUnit,
  secondaryUnits,
  availableUnits,
  onAddSecondaryUnit,
  onRemoveSecondaryUnit,
  isLoading = false
}) => {
  console.log("📦 SecondaryUnitsManager:", {
    primaryUnit: primaryUnit?.value,
    secondaryUnits: secondaryUnits.length,
    availableUnits: availableUnits.length
  });

  // Filter out primary unit and already selected secondary units
  const availableSecondaryUnits = availableUnits.filter(unit => 
    unit.id !== primaryUnit?.id && 
    !secondaryUnits.some(su => su.id === unit.id)
  );

  const handleAddUnit = (unitId: string) => {
    if (!unitId) return;
    
    const unit = availableUnits.find(u => u.id === unitId);
    if (unit) {
      console.log("➕ Adding secondary unit:", unit);
      onAddSecondaryUnit(unit);
    }
  };

  const handleRemoveUnit = (unitId: string) => {
    console.log("🗑️ Removing secondary unit:", unitId);
    onRemoveSecondaryUnit(unitId);
  };

  const calculateConversionFactor = (secondaryUnit: ProductUnit): string => {
    if (!primaryUnit) return "1:1";
    
    if (secondaryUnit.packageQuantity === primaryUnit.packageQuantity) {
      return "1:1";
    } else if (secondaryUnit.packageQuantity > primaryUnit.packageQuantity) {
      const factor = secondaryUnit.packageQuantity / primaryUnit.packageQuantity;
      return `1:${factor}`;
    } else {
      const factor = primaryUnit.packageQuantity / secondaryUnit.packageQuantity;
      return `${factor}:1`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm">Unidades Secundárias</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Select direto para adicionar unidades */}
        {primaryUnit && availableSecondaryUnits.length > 0 && (
          <div>
            <Select onValueChange={handleAddUnit} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade para adicionar..." />
              </SelectTrigger>
              <SelectContent>
                {availableSecondaryUnits.map(unit => (
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
          </div>
        )}

        {/* Lista das unidades secundárias selecionadas */}
        {!primaryUnit ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Selecione primeiro uma unidade principal
          </p>
        ) : secondaryUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {availableSecondaryUnits.length === 0 
              ? "Todas as unidades disponíveis já foram utilizadas"
              : "Nenhuma unidade secundária adicionada"
            }
          </p>
        ) : (
          <div className="space-y-2">
            {secondaryUnits.map(unit => (
              <div key={unit.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{unit.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {unit.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {calculateConversionFactor(unit)}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => handleRemoveUnit(unit.id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
