
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
      // Delete from Supabase
      const { error } = await supabase
        .from('sales_reps')
        .delete()
        .eq('id', salesRep.id);
      
      if (error) throw error;
      
      setSalesReps(currentSalesReps => 
        currentSalesReps.filter(sr => sr.id !== salesRep.id)
      );
      onOpenChange(false);
      toast("Representante excluído", {
        description: "Representante excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting sales rep:", error);
      toast.error("Erro ao excluir representante", {
        description: "Houve um problema ao excluir o representante."
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
