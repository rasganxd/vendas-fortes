
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Crown, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductUnits } from '../hooks/useProductUnits';
import { formatCurrency } from '@/lib/utils';
import { SelectedUnit } from '@/types/productFormUnits';

interface ProductUnitsSelectorProps {
  selectedUnits: SelectedUnit[];
  mainUnitId: string | null;
  onAddUnit: (unit: { id: string; value: string; label: string; packageQuantity: number }) => void;
  onRemoveUnit: (unitId: string) => void;
  onSetMainUnit: (unitId: string) => void;
  productPrice: number;
  className?: string;
}

export const ProductUnitsSelector: React.FC<ProductUnitsSelectorProps> = ({
  selectedUnits,
  mainUnitId,
  onAddUnit,
  onRemoveUnit,
  onSetMainUnit,
  productPrice,
  className
}) => {
  const { units: allUnits, isLoading } = useProductUnits();
  const [addUnitDialogOpen, setAddUnitDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  console.log("🔍 ProductUnitsSelector state:", {
    allUnits: allUnits.length,
    selectedUnits: selectedUnits.length,
    selectedUnitIds: selectedUnits.map(u => u.unitId),
    isLoading,
    selectedUnitId
  });

  // Filter available units that haven't been selected yet
  const availableUnits = allUnits.filter(
    unit => !selectedUnits.some(su => su.unitId === unit.id)
  );

  console.log("📋 Available units:", availableUnits.map(u => ({ id: u.id, value: u.value })));

  const handleAddUnit = () => {
    if (!selectedUnitId) {
      console.log("⚠️ No unit selected");
      return;
    }
    
    const unit = allUnits.find(u => u.id === selectedUnitId);
    console.log("➕ Adding unit:", { selectedUnitId, unit });
    
    if (unit) {
      // Garantir que estamos passando dados válidos
      const unitData = {
        id: unit.id,
        value: unit.value,
        label: unit.label,
        packageQuantity: unit.packageQuantity
      };
      
      console.log("📤 Sending unit data:", unitData);
      
      onAddUnit(unitData);
      console.log("✅ Unit add function called successfully");
    } else {
      console.log("❌ Unit not found:", selectedUnitId);
    }
    
    setAddUnitDialogOpen(false);
    setSelectedUnitId('');
  };

  const handleRemoveUnit = (unitId: string) => {
    console.log("🗑️ Removing unit:", unitId);
    onRemoveUnit(unitId);
  };

  const handleSetMainUnit = (unitId: string) => {
    console.log("👑 Setting main unit:", unitId);
    onSetMainUnit(unitId);
  };

  const calculateUnitPrice = (unit: SelectedUnit): number => {
    if (!mainUnitId || productPrice === 0) return 0;
    
    const mainUnit = selectedUnits.find(u => u.unitId === mainUnitId);
    if (!mainUnit) return 0;
    
    if (unit.unitId === mainUnitId) {
      return productPrice;
    }
    
    // Lógica corrigida: 
    // Se a unidade principal tem 18 unidades e custa R$ 69,00
    // E queremos o preço de uma unidade com 1 unidade
    // Preço da unidade = preço principal / (packageQuantity principal / packageQuantity da unidade)
    // Exemplo: R$ 69,00 / (18 / 1) = R$ 69,00 / 18 = R$ 3,83
    const conversionRatio = mainUnit.packageQuantity / unit.packageQuantity;
    return productPrice / conversionRatio;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Carregando unidades...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Unidades do Produto</CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            type="button"
            onClick={() => setAddUnitDialogOpen(true)}
            disabled={availableUnits.length === 0}
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {selectedUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma unidade selecionada. Adicione pelo menos uma unidade.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedUnits.map(unit => (
              <div 
                key={unit.unitId}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{unit.unitValue}</span>
                  <span className="text-sm text-muted-foreground">
                    {unit.unitLabel}
                  </span>
                  {unit.isMainUnit && (
                    <Badge variant="default" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatCurrency(calculateUnitPrice(unit))}
                  </span>
                  {!unit.isMainUnit && (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => handleSetMainUnit(unit.unitId)}
                      className="h-6 px-2 text-xs"
                    >
                      Definir como principal
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => handleRemoveUnit(unit.unitId)}
                    className="h-6 w-6 p-0"
                    disabled={selectedUnits.length === 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && selectedUnits.length > 0 && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug Units:</strong>
            {selectedUnits.map(unit => (
              <div key={unit.unitId} className="text-xs">
                {unit.unitValue} (ID: {unit.unitId.substring(0, 8)}...) - Main: {unit.isMainUnit ? 'Sim' : 'Não'}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog para adicionar unidade */}
      <Dialog open={addUnitDialogOpen} onOpenChange={setAddUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Unidade ao Produto</DialogTitle>
            <DialogDescription>
              Selecione uma unidade para associar a este produto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.value} - {unit.label} ({unit.packageQuantity} unidades)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {availableUnits.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todas as unidades disponíveis já foram adicionadas.
              </p>
            )}

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 bg-gray-100 rounded text-xs">
                <strong>Debug:</strong> Selected: {selectedUnitId || 'Nenhuma'} | Available: {availableUnits.length}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddUnitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleAddUnit} 
              disabled={!selectedUnitId || availableUnits.length === 0}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
