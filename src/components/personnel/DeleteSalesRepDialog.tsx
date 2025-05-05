
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SalesRep } from '@/types';
import { salesRepService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';

interface DeleteSalesRepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesRep: SalesRep;
  setSalesReps: (callback: (salesReps: SalesRep[]) => SalesRep[]) => void;
}

export const DeleteSalesRepDialog: React.FC<DeleteSalesRepDialogProps> = ({
  open,
  onOpenChange,
  salesRep,
  setSalesReps
}) => {
  const handleDelete = async () => {
    try {
      await salesRepService.delete(salesRep.id);
      setSalesReps(currentSalesReps => 
        currentSalesReps.filter(sr => sr.id !== salesRep.id)
      );
      onOpenChange(false);
      toast({
        title: "Representante excluído",
        description: "Representante excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting sales rep:", error);
      toast({
        title: "Erro ao excluir representante",
        description: "Houve um problema ao excluir o representante.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Representante</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o representante {salesRep.name}?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
