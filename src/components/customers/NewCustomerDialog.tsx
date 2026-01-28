
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewCustomerForm from './NewCustomerForm';
import { Customer } from '@/types/customer';
import { useAppData } from '@/context/providers/AppDataProvider';

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
  const {
    addCustomer
  } = useAppData();

  const handleSubmit = async (data: Omit<Customer, 'id'>) => {
    try {
      console.log("=== NewCustomerDialog submitting ===", data);
      
      const customerId = await addCustomer(data);
      console.log("✅ Customer added successfully with ID:", customerId);

      // Close dialog on success - toast is shown by useCustomers hook
      onOpenChange(false);
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error("❌ Error in NewCustomerDialog:", error);
      // Error toast is already shown by useCustomers hook
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Cliente</DialogTitle>
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
