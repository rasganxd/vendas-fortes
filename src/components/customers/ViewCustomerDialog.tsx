
import React from 'react';
import { Customer } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import CustomerDetails from './CustomerDetails';

interface ViewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEdit: () => void;
  onDelete: () => void;
}

const ViewCustomerDialog: React.FC<ViewCustomerDialogProps> = ({
  open,
  onOpenChange,
  customer,
  onEdit,
  onDelete
}) => {
  if (!customer) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-3 sm:p-4">
        <DialogHeader>
          <DialogTitle>Visualizar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-4">
          <CustomerDetails 
            customer={customer}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerDialog;
