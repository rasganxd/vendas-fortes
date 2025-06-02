
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewCustomerForm from './NewCustomerForm';
import { Customer } from '@/types/customer';
import { useAppData } from '@/context/providers/AppDataProvider';
import { toast } from '@/components/ui/use-toast';

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode: number;
  onSubmit?: (data: any) => void;
}

const NewCustomerDialog: React.FC<NewCustomerDialogProps> = ({
  open,
  onOpenChange,
  initialCode,
  onSubmit
}) => {
  const { addCustomer } = useAppData();

  const handleSubmit = async (data: Omit<Customer, 'id'>) => {
    try {
      console.log("=== NewCustomerDialog submitting ===", data);

      // Show loading state
      toast({
        title: "Adicionando cliente...",
        description: "Por favor, aguarde."
      });
      
      const customerId = await addCustomer(data);
      console.log("✅ Customer added successfully with ID:", customerId);
      
      if (customerId && customerId !== "") {
        toast({
          title: "✅ Cliente adicionado",
          description: `${data.name} foi adicionado com sucesso!`
        });
        onOpenChange(false);
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        throw new Error("ID do cliente não foi retornado");
      }
    } catch (error) {
      console.error("❌ Error in NewCustomerDialog:", error);
      toast({
        title: "❌ Erro ao adicionar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <NewCustomerForm 
          initialCode={initialCode} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomerDialog;
