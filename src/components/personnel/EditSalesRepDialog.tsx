
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
import { Textarea } from '../ui/textarea';
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSalesRep({ ...salesRep, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setSalesRep({ ...salesRep, active: checked });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="document">Documento</Label>
            <Input
              id="document"
              name="document"
              value={salesRep.document || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Função</Label>
            <Input
              id="role"
              name="role"
              value={salesRep.role || 'sales'}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              value={salesRep.address || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              name="city"
              value={salesRep.city || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              name="state"
              value={salesRep.state || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="zip">CEP</Label>
            <Input
              id="zip"
              name="zip"
              value={salesRep.zip || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={salesRep.notes || ''}
              onChange={handleChange}
              rows={3}
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
