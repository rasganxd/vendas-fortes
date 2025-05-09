
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintDialogActionsProps {
  handleBulkPrint: () => void;
  onOpenChange: (open: boolean) => void;
  isPrintDisabled: boolean;
}

const PrintDialogActions: React.FC<PrintDialogActionsProps> = ({
  handleBulkPrint,
  onOpenChange,
  isPrintDisabled
}) => {
  return (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button 
        onClick={handleBulkPrint} 
        variant="sales"
        disabled={isPrintDisabled}
        className="flex items-center gap-2"
      >
        <Printer size={16} /> Imprimir
      </Button>
    </div>
  );
};

export default PrintDialogActions;
