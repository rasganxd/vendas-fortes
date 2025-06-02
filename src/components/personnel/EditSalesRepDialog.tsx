
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SalesRep } from '@/types';
import { DialogFooter } from '../ui/dialog';
import { Switch } from '../ui/switch';

interface EditSalesRepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesRep: Partial<SalesRep> | null;
  onSave?: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  onRefresh?: () => void;
}

export const EditSalesRepDialog: React.FC<EditSalesRepDialogProps> = ({
  open,
  onOpenChange,
  salesRep,
  onSave,
  onRefresh
}) => {
  const [formData, setFormData] = React.useState<Partial<SalesRep>>({
    code: 0,
    name: '',
    phone: '',
    email: '',
    active: true
  });

  React.useEffect(() => {
    if (salesRep) {
      setFormData(salesRep);
    }
  }, [salesRep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    
    try {
      if (onSave) {
        await onSave({
          code: formData.code || 0,
          name: formData.name,
          phone: formData.phone || '',
          email: formData.email,
          active: formData.active ?? true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      if (onRefresh) {
        onRefresh();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving sales rep:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {salesRep?.id ? 'Editar Vendedor' : 'Novo Vendedor'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              name="code"
              value={formData.code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, code: parseInt(e.target.value) || 0 }))}
              type="number"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Nome completo do vendedor"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="vendedor@empresa.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.active ?? true} 
              onCheckedChange={handleSwitchChange} 
              id="active"
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.email}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSalesRepDialog;
