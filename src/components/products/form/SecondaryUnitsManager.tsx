
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

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

  const handleAddUnit = () => {
    if (!selectedUnitId) return;
    
    const unit = availableUnits.find(u => u.id === selectedUnitId);
    if (unit) {
      console.log("➕ Adding secondary unit:", unit);
      onAddSecondaryUnit(unit);
      setAddDialogOpen(false);
      setSelectedUnitId('');
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm">Unidades Secundárias</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setAddDialogOpen(true)}
            disabled={isLoading || availableSecondaryUnits.length === 0 || !primaryUnit}
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!primaryUnit ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Selecione primeiro uma unidade principal
          </p>
        ) : secondaryUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma unidade secundária adicionada
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

      {/* Dialog para adicionar unidade secundária */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Unidade Secundária</DialogTitle>
            <DialogDescription>
              Selecione uma unidade adicional para este produto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
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
            
            {availableSecondaryUnits.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todas as unidades disponíveis já foram adicionadas.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddUnit}
              disabled={!selectedUnitId || availableSecondaryUnits.length === 0}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
