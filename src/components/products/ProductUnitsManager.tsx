
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Crown } from 'lucide-react';
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
import { useProductUnitsMapping } from '@/hooks/useProductUnitsMapping';
import { useProductUnits } from './hooks/useProductUnits';
import { formatCurrency } from '@/lib/utils';

interface ProductUnitsManagerProps {
  productId: string;
  productPrice: number;
  className?: string;
}

export const ProductUnitsManager: React.FC<ProductUnitsManagerProps> = ({
  productId,
  productPrice,
  className
}) => {
  const { units: allUnits } = useProductUnits();
  const {
    productUnits,
    mainUnit,
    isLoading,
    addUnitToProduct,
    removeUnitFromProduct,
    setMainUnitForProduct,
    calculateUnitPrice
  } = useProductUnitsMapping(productId);

  const [addUnitDialogOpen, setAddUnitDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [unitPrices, setUnitPrices] = useState<Record<string, number>>({});

  // Calcular preços para cada unidade
  React.useEffect(() => {
    const calculatePrices = async () => {
      if (!mainUnit || productUnits.length === 0) return;
      
      const prices: Record<string, number> = {};
      
      for (const unit of productUnits) {
        if (unit.isMainUnit) {
          prices[unit.id] = productPrice;
        } else {
          const price = await calculateUnitPrice(productPrice, mainUnit.id, unit.id);
          prices[unit.id] = price;
        }
      }
      
      setUnitPrices(prices);
    };
    
    calculatePrices();
  }, [productUnits, mainUnit, productPrice, calculateUnitPrice]);

  const availableUnits = allUnits.filter(
    unit => !productUnits.some(pu => pu.id === unit.id)
  );

  const handleAddUnit = async () => {
    if (!selectedUnitId) return;
    
    const isFirstUnit = productUnits.length === 0;
    await addUnitToProduct(selectedUnitId, isFirstUnit);
    setAddUnitDialogOpen(false);
    setSelectedUnitId('');
  };

  const handleRemoveUnit = async (unitId: string) => {
    await removeUnitFromProduct(unitId);
  };

  const handleSetMainUnit = async (unitId: string) => {
    await setMainUnitForProduct(unitId);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando unidades...</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Unidades do Produto</CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setAddUnitDialogOpen(true)}
            disabled={availableUnits.length === 0}
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {productUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma unidade associada a este produto
          </p>
        ) : (
          <div className="space-y-2">
            {productUnits.map(unit => (
              <div 
                key={unit.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{unit.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {unit.label}
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
                    {formatCurrency(unitPrices[unit.id] || 0)}
                  </span>
                  {!unit.isMainUnit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetMainUnit(unit.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Definir como principal
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveUnit(unit.id)}
                    className="h-6 w-6 p-0"
                    disabled={productUnits.length === 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUnitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUnit} disabled={!selectedUnitId}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
