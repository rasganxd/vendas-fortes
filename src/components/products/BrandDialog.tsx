
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductBrand } from '@/types';
import { toast } from 'sonner';

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: ProductBrand | null;
  onSave: (brand: Omit<ProductBrand, 'id'>) => void;
}

export const BrandDialog: React.FC<BrandDialogProps> = ({ 
  open, 
  onOpenChange, 
  brand, 
  onSave 
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Reset form when dialog opens/closes or brand changes
  React.useEffect(() => {
    if (brand) {
      setName(brand.name);
      setDescription(brand.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [brand, open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast("Nome obrigatório", {
        description: "Por favor, informe o nome da marca"
      });
      return;
    }

    onSave({
      name,
      description,
      notes: brand?.notes || '',
      createdAt: brand?.createdAt || new Date(),
      updatedAt: new Date()
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? 'Editar' : 'Nova'} Marca</DialogTitle>
          <DialogDescription>
            {brand
              ? 'Altere os dados da marca selecionada'
              : 'Preencha os dados para criar uma nova marca'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brandName" className="text-right">
              Nome
            </Label>
            <Input
              id="brandName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brandDescription" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="brandDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
