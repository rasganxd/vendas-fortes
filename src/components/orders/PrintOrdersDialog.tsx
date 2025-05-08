
import React, { useState, useEffect } from 'react';
import { Order, Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import CustomerSelect from './print/CustomerSelect';

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
          
          <div className="flex justify-end">
            <Button onClick={handlePrint} className="flex items-center">
              <Printer size={16} className="mr-2" /> Imprimir {ordersToPrint.length} pedido(s)
            </Button>
          </div>
        </div>
        
        <div className="hidden print:block">
          {ordersToPrint.map((order, index) => (
            <div key={order.id} className="print-order">
              <h3 className="text-lg font-bold">Pedido #{order.code}</h3>
              <p><strong>Cliente:</strong> {order.customerName}</p>
              <p><strong>Data:</strong> {order.date instanceof Date 
                ? order.date.toLocaleDateString('pt-BR') 
                : new Date(order.date).toLocaleDateString('pt-BR')}
              </p>
              
              <table className="w-full mt-2 border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Produto</th>
                    <th className="text-right">Qtd</th>
                    <th className="text-right">Preço</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId} className="border-b">
                      <td>{item.productName}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.price || item.unitPrice)}</td>
                      <td className="text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-bold">Total:</td>
                    <td className="text-right font-bold">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
              
              {index < ordersToPrint.length - 1 && <div className="print-page-break"></div>}
            </div>
          ))}
          <div className="print-footer">
            <p>Impresso em: {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrdersDialog;
