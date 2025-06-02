
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
import { ProductCategory } from '@/types';
import { toast } from 'sonner';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ProductCategory | null;
  onSave: (category: Omit<ProductCategory, 'id'>) => void;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({ 
  open, 
  onOpenChange, 
  category, 
  onSave 
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Reset form when dialog opens/closes or category changes
  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [category, open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast("Nome obrigatório", {
        description: "Por favor, informe o nome da categoria"
      });
      return;
    }

    onSave({
      name,
      description,
      notes: category?.notes || '',
      createdAt: category?.createdAt || new Date(),
      updatedAt: new Date()
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar' : 'Nova'} Categoria</DialogTitle>
          <DialogDescription>
            {category
              ? 'Altere os dados da categoria selecionada'
              : 'Preencha os dados para criar uma nova categoria'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryName" className="text-right">
              Nome
            </Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryDescription" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="categoryDescription"
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
