
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

  console.log("🔍 ProductUnitsSelector:", {
    allUnits: allUnits.length,
    selectedUnits: selectedUnits.length,
    mainUnitId,
    isLoading
  });

  // Filtrar unidades disponíveis que ainda não foram selecionadas
  const availableUnits = allUnits.filter(
    unit => !selectedUnits.some(su => su.unitId === unit.id)
  );

  const handleAddUnit = () => {
    if (!selectedUnitId) return;
    
    const unit = allUnits.find(u => u.id === selectedUnitId);
    console.log("➕ Adicionando unidade:", { selectedUnitId, unit });
    
    if (unit) {
      onAddUnit({
        id: unit.id,
        value: unit.value,
        label: unit.label,
        packageQuantity: unit.packageQuantity
      });
      console.log("✅ Unidade adicionada");
    }
    
    setAddUnitDialogOpen(false);
    setSelectedUnitId('');
  };

  const calculateUnitPrice = (unit: SelectedUnit): number => {
    if (!mainUnitId || productPrice === 0) return 0;
    
    const mainUnit = selectedUnits.find(u => u.unitId === mainUnitId);
    if (!mainUnit) return 0;
    
    if (unit.unitId === mainUnitId) {
      return productPrice;
    }
    
    // Fator de conversão: quantidade da unidade principal / quantidade da unidade atual
    const conversionRatio = mainUnit.packageQuantity / unit.packageQuantity;
    return productPrice / conversionRatio;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 border rounded-md bg-gray-50">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Carregando unidades disponíveis...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium">Unidades Selecionadas</h4>
        <Button 
          size="sm" 
          variant="outline"
          type="button"
          onClick={() => setAddUnitDialogOpen(true)}
          disabled={availableUnits.length === 0}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Adicionar Unidade
        </Button>
      </div>

      {/* Lista de unidades selecionadas */}
      {selectedUnits.length === 0 ? (
        <div className="border rounded-md p-6 text-center bg-gray-50">
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma unidade selecionada
          </p>
          <p className="text-xs text-muted-foreground">
            Clique em "Adicionar Unidade" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-2 border rounded-md p-3">
          {selectedUnits.map(unit => (
            <div 
              key={unit.unitId}
              className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                unit.isMainUnit ? 'bg-blue-50 border-blue-200' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{unit.unitValue}</span>
                    <span className="text-xs text-muted-foreground">
                      {unit.unitLabel}
                    </span>
                    {unit.isMainUnit && (
                      <Badge variant="default" className="text-xs flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {unit.packageQuantity} {unit.packageQuantity === 1 ? 'unidade' : 'unidades'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {productPrice > 0 && (
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(calculateUnitPrice(unit))}
                  </span>
                )}
                
                {!unit.isMainUnit && (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => onSetMainUnit(unit.unitId)}
                    className="h-7 px-2 text-xs"
                  >
                    Tornar principal
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => onRemoveUnit(unit.unitId)}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={selectedUnits.length === 1}
                  title={selectedUnits.length === 1 ? "Não é possível remover a única unidade" : "Remover unidade"}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog para adicionar unidade */}
      <Dialog open={addUnitDialogOpen} onOpenChange={setAddUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Unidade ao Produto</DialogTitle>
            <DialogDescription>
              Selecione uma unidade de medida para associar a este produto
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
                    <div className="flex items-center justify-between w-full">
                      <span>{unit.value} - {unit.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({unit.packageQuantity} {unit.packageQuantity === 1 ? 'unidade' : 'unidades'})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {availableUnits.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  Todas as unidades disponíveis já foram adicionadas ao produto.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setAddUnitDialogOpen(false);
                setSelectedUnitId('');
              }}
            >
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
    </div>
  );
};
