
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Printer } from 'lucide-react';

interface OrdersActionButtonsProps {
  handleNewOrder: () => void;
  handlePrintOrders: () => void;
  selectedOrderCount: number;
  importButton?: React.ReactNode;
}

export default function OrdersActionButtons({ 
  handleNewOrder, 
  handlePrintOrders, 
  selectedOrderCount,
  importButton 
}: OrdersActionButtonsProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-medium">Lista de Pedidos</h2>
        <p className="text-sm text-gray-600">
          Gerencie todos os pedidos do sistema
        </p>
      </div>
      
      <div className="flex gap-2">
        {importButton}
        
        <Button
          variant="outline"
          onClick={handlePrintOrders}
          disabled={selectedOrderCount === 0}
        >
          <Printer size={16} className="mr-2" />
          Imprimir ({selectedOrderCount})
        </Button>
        
        <Button onClick={handleNewOrder} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Novo Pedido
        </Button>
      </div>
    </div>
  );
}
