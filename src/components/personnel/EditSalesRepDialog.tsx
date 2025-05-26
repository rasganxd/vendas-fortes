
import React from 'react';
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
  salesRep: Partial<SalesRep>;
  setSalesRep: (salesRep: any) => void;
  onSave?: () => void;
  title: string;
}

export const EditSalesRepDialog: React.FC<EditSalesRepDialogProps> = ({
  open,
  onOpenChange,
  salesRep,
  setSalesRep,
  onSave,
  title
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSalesRep({ ...salesRep, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setSalesRep({ ...salesRep, active: checked });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              name="code"
              value={salesRep.code || ''}
              onChange={(e) => setSalesRep({ ...salesRep, code: parseInt(e.target.value) || 0 })}
              type="number"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={salesRep.name || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={salesRep.email || ''}
              onChange={handleChange}
              placeholder="vendedor@empresa.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={salesRep.phone || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={salesRep.active ?? true} 
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
          <Button onClick={onSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
