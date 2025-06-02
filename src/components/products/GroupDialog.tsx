
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
import { ProductGroup } from '@/types';
import { toast } from 'sonner';

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ProductGroup | null;
  onSave: (group: Omit<ProductGroup, 'id'>) => void;
}

export const GroupDialog: React.FC<GroupDialogProps> = ({ 
  open, 
  onOpenChange, 
  group, 
  onSave 
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Reset form when dialog opens/closes or group changes
  React.useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [group, open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast("Nome obrigatório", {
        description: "Por favor, informe o nome do grupo"
      });
      return;
    }

    onSave({
      name,
      description,
      notes: group?.notes || '',
      createdAt: group?.createdAt || new Date(),
      updatedAt: new Date()
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group ? 'Editar' : 'Novo'} Grupo</DialogTitle>
          <DialogDescription>
            {group
              ? 'Altere os dados do grupo selecionado'
              : 'Preencha os dados para criar um novo grupo'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="groupName" className="text-right">
              Nome
            </Label>
            <Input
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="groupDescription" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="groupDescription"
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
