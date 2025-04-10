
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
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button 
        onClick={handleBulkPrint} 
        className="bg-sales-800 hover:bg-sales-700"
        disabled={isPrintDisabled}
      >
        <Printer size={16} className="mr-2" /> Imprimir
      </Button>
    </div>
  );
};

export default PrintDialogActions;
