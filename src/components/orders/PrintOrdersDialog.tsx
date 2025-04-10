
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order, Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import refactored components
import CustomerSelect from './print/CustomerSelect';
import SelectAllOrdersCheckbox from './print/SelectAllOrdersCheckbox';
import PrintSummary from './print/PrintSummary';
import PrintDialogActions from './print/PrintDialogActions';
import PrintableOrderContent from './print/PrintableOrderContent';

interface PrintOrdersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  customers: Customer[];
  selectedOrderIds: string[];
  setSelectedOrderIds: (ids: string[]) => void;
  filteredOrders: Order[];
  formatCurrency: (value: number | undefined) => string;
}

const PrintOrdersDialog: React.FC<PrintOrdersDialogProps> = ({
  isOpen,
  onOpenChange,
  orders,
  customers,
  selectedOrderIds,
  setSelectedOrderIds,
  filteredOrders,
  formatCurrency,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>('all');
  const bulkPrintRef = useRef<HTMLDivElement>(null);
  
  const handleBulkPrint = useReactToPrint({
    content: () => bulkPrintRef.current,
    documentTitle: 'Pedidos',
  });

  const handleSelectAllOrders = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(order => order.id));
    }
  };

  const getOrdersBySelection = () => {
    if (selectedCustomerId === 'all') {
      return selectedOrderIds.length > 0 
        ? orders.filter(order => selectedOrderIds.includes(order.id))
        : filteredOrders;
    } else {
      return orders.filter(order => order.customerId === selectedCustomerId);
    }
  };

  const printableOrders = getOrdersBySelection();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="mb-6">Imprimir Pedidos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-6">
          <CustomerSelect 
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            customers={customers}
          />
          
          {selectedCustomerId === 'all' && (
            <SelectAllOrdersCheckbox 
              filteredOrders={filteredOrders}
              selectedOrderIds={selectedOrderIds}
              handleSelectAllOrders={handleSelectAllOrders}
            />
          )}
          
          <PrintSummary 
            printableOrders={printableOrders}
            selectedCustomerId={selectedCustomerId}
            customers={customers}
          />
        </div>
        
        <PrintDialogActions 
          handleBulkPrint={handleBulkPrint}
          onOpenChange={onOpenChange}
          isPrintDisabled={printableOrders.length === 0}
        />
        
        <div ref={bulkPrintRef}>
          <PrintableOrderContent 
            orders={printableOrders}
            customers={customers}
            formatCurrency={formatCurrency}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrdersDialog;
