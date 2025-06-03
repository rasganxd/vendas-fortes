
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditCustomerForm from './EditCustomerForm';
import { Customer } from '@/types/customer';

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSubmit: (data: Partial<Customer>) => void;
}

const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  open,
  onOpenChange,
  customer,
  onSubmit
}) => {
  const handleSubmit = (data: Partial<Customer>) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Cliente</DialogTitle>
        </DialogHeader>
        <EditCustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
