
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/firebase/salesRepService';
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
      console.log(`Deleting sales rep with ID: ${salesRep.id}`);
      
      // Use Firebase service instead of Supabase
      await salesRepService.delete(salesRep.id);
      
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Representante</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o representante {salesRep.name}?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSalesRepDialog;
