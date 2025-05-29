
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Unit } from '@/types/unit';
import { toast } from "sonner";

interface EditUnitDialogProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Unit) => void;
  baseUnits: Unit[];
}

export default function EditUnitDialog({
  unit,
  isOpen,
  onClose,
  onSave,
}: EditUnitDialogProps) {
  const [editData, setEditData] = useState({
    value: '',
    label: '',
    packageQuantity: 1
  });

  useEffect(() => {
    if (unit) {
      setEditData({
        value: unit.value,
        label: unit.label,
        packageQuantity: unit.packageQuantity || 1
      });
    }
  }, [unit]);

  const handleSave = () => {
    if (!editData.value || !editData.label) {
      toast("Erro", {
        description: "Preencha todos os campos obrigatórios",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    const updatedUnit: Unit = {
      value: editData.value.toUpperCase(),
      label: editData.label,
      packageQuantity: editData.packageQuantity
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
          <DialogTitle>Editar Unidade</DialogTitle>
          <DialogDescription>
            Edite os dados da unidade de medida
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editUnitValue">Código da Unidade</Label>
            <Input
              id="editUnitValue"
              value={editData.value}
              onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editUnitLabel">Nome Completo</Label>
            <Input
              id="editUnitLabel"
              value={editData.label}
              onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPackageQuantity">Quantidade na Embalagem</Label>
            <Input
              id="editPackageQuantity"
              type="number"
              value={editData.packageQuantity}
              onChange={(e) => setEditData(prev => ({ 
                ...prev, 
                packageQuantity: parseFloat(e.target.value) || 1 
              }))}
              min="0.001"
              step="0.001"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
