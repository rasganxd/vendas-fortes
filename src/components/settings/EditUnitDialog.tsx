
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Unit } from '@/types/unit';

interface EditUnitDialogProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUnit: Unit) => void;
  baseUnits: Unit[];
}

export default function EditUnitDialog({
  unit,
  isOpen,
  onClose,
  onSave,
  baseUnits
}: EditUnitDialogProps) {
  const [editingUnit, setEditingUnit] = useState({
    value: '',
    label: '',
    conversionRate: 1,
    baseUnit: '',
    isBaseUnit: false
  });

  useEffect(() => {
    if (unit) {
      setEditingUnit({
        value: unit.value,
        label: unit.label,
        conversionRate: unit.conversionRate || 1,
        baseUnit: unit.baseUnit || '',
        isBaseUnit: unit.isBaseUnit || false
      });
    }
  }, [unit]);

  const handleSave = () => {
    if (!editingUnit.value || !editingUnit.label) {
      toast("Erro", {
        description: "Preencha todos os campos",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    if (!editingUnit.isBaseUnit && !editingUnit.baseUnit) {
      toast("Erro", {
        description: "Selecione uma unidade base ou marque como unidade base",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    const updatedUnit: Unit = {
      value: editingUnit.value.toUpperCase(),
      label: editingUnit.label,
      isBaseUnit: editingUnit.isBaseUnit,
      ...(editingUnit.isBaseUnit ? {} : {
        baseUnit: editingUnit.baseUnit,
        conversionRate: editingUnit.conversionRate
      })
    };

    onSave(updatedUnit);
    onClose();
    
    toast("Unidade atualizada", {
      description: "A unidade foi atualizada com sucesso"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Unidade de Medida</DialogTitle>
          <DialogDescription>
            Modifique os dados da unidade de medida
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editUnitValue">Código da Unidade</Label>
            <Input
              id="editUnitValue"
              placeholder="Ex: FARDO, DECA, etc."
              value={editingUnit.value}
              onChange={(e) => setEditingUnit(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editUnitLabel">Nome Completo</Label>
            <Input
              id="editUnitLabel"
              placeholder="Ex: Fardo (FARDO), Dezena (DECA)"
              value={editingUnit.label}
              onChange={(e) => setEditingUnit(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="editIsBaseUnit"
              checked={editingUnit.isBaseUnit}
              onChange={(e) => setEditingUnit(prev => ({ 
                ...prev, 
                isBaseUnit: e.target.checked,
                baseUnit: e.target.checked ? '' : prev.baseUnit
              }))}
            />
            <Label htmlFor="editIsBaseUnit">Esta é uma unidade base</Label>
          </div>
          
          {!editingUnit.isBaseUnit && (
            <>
              <div className="space-y-2">
                <Label>Unidade Base</Label>
                <Select 
                  value={editingUnit.baseUnit} 
                  onValueChange={(value) => setEditingUnit(prev => ({ ...prev, baseUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade base" />
                  </SelectTrigger>
                  <SelectContent>
                    {baseUnits.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editConversionRate">Taxa de Conversão</Label>
                <Input
                  id="editConversionRate"
                  type="number"
                  placeholder="Ex: 24 (1 desta unidade = 24 da base)"
                  value={editingUnit.conversionRate}
                  onChange={(e) => setEditingUnit(prev => ({ 
                    ...prev, 
                    conversionRate: parseFloat(e.target.value) || 1 
                  }))}
                  min="0.001"
                  step="0.001"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
