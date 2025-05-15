
import React, { useState, useEffect } from 'react';
import { Order, Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import CustomerSelect from './print/CustomerSelect';
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
  formatCurrency
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [ordersToPrint, setOrdersToPrint] = useState<Order[]>([]);
  
  // Ensure customers array is valid
  const validCustomers = customers.filter(customer => customer && customer.id);

  useEffect(() => {
    if (selectedOrderIds.length > 0) {
      setOrdersToPrint(orders.filter(order => selectedOrderIds.includes(order.id)));
    } else {
      const filtered = selectedCustomerId === "all" 
        ? filteredOrders 
        : filteredOrders.filter(order => order.customerId === selectedCustomerId);
      setOrdersToPrint(filtered);
    }
  }, [selectedOrderIds, selectedCustomerId, orders, filteredOrders]);
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Pedidos</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <CustomerSelect 
            selectedCustomerId={selectedCustomerId} 
            setSelectedCustomerId={setSelectedCustomerId}
            customers={validCustomers}
          />
        </div>
        
        <DialogFooter>
          <PrintDialogActions
            handleBulkPrint={handlePrint}
            onOpenChange={onOpenChange}
            isPrintDisabled={ordersToPrint.length === 0}
          />
        </DialogFooter>
        
        {/* Printable content using dedicated component */}
        <PrintableOrderContent 
          orders={ordersToPrint}
          customers={customers}
          formatCurrency={formatCurrency}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrdersDialog;
