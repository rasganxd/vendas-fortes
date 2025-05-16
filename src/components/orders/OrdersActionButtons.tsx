
import React from 'react';
import { Plus, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrdersActionButtonsProps {
  handleNewOrder: () => void;
  handlePrintOrders: () => void;
  selectedOrderCount: number;
}

const OrdersActionButtons: React.FC<OrdersActionButtonsProps> = ({
  handleNewOrder,
  handlePrintOrders,
  selectedOrderCount
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button 
        onClick={handleNewOrder} 
        variant="default" 
        className="bg-sales-800 hover:bg-sales-700"
      >
        <Plus className="h-4 w-4 mr-2" /> Novo Pedido
      </Button>
      <Button
        onClick={handlePrintOrders}
        variant="outline"
        disabled={selectedOrderCount === 0}
      >
        <Clipboard className="h-4 w-4 mr-2" /> Imprimir
        {selectedOrderCount > 0 && (
          <span className="ml-2 bg-sales-100 text-sales-700 rounded-full px-2 py-0.5 text-xs font-medium">
            {selectedOrderCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default OrdersActionButtons;
