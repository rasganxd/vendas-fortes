
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import NewCustomerForm from './NewCustomerForm';

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode: number;
  onSubmit: (data: any) => void;
}

const NewCustomerDialog: React.FC<NewCustomerDialogProps> = ({
  open,
  onOpenChange,
  initialCode,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-2 sm:p-3">
        <DialogHeader className="px-1">
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo cliente
          </DialogDescription>
        </DialogHeader>
        
        <NewCustomerForm 
          initialCode={initialCode}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomerDialog;
