
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewCustomerForm from './NewCustomerForm';
import { Customer } from '@/types/customer';
import { useCustomers } from '@/hooks/useCustomers';

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
  const { addCustomer } = useCustomers();

  const handleSubmit = async (data: Omit<Customer, 'id'>) => {
    try {
      console.log("=== NewCustomerDialog submitting ===", data);
      const customerId = await addCustomer(data);
      console.log("✅ Customer added successfully with ID:", customerId);
      
      if (customerId && customerId !== "") {
        onOpenChange(false);
        if (onSubmit) {
          onSubmit(data);
        }
      }
    } catch (error) {
      console.error("❌ Error in NewCustomerDialog:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
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
