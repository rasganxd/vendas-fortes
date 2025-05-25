
import React from 'react';
import { OrderItem } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import OrderItemsTable from './OrderItemsTable';

interface OrderItemsSectionProps {
  orderItems: OrderItem[];
  handleRemoveItem: (productId: string) => void;
  calculateTotal: () => number;
  isEditMode: boolean;
}

export default function OrderItemsSection({
  orderItems,
  handleRemoveItem,
  calculateTotal,
  isEditMode
}: OrderItemsSectionProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-0">
        <div className="px-4 py-2 border-b bg-gray-50">
          <h4 className="text-sm font-medium text-gray-800">
            Itens do Pedido
            {isEditMode && (
              <span className="ml-2 text-xs text-blue-600">(Clique na lixeira para remover)</span>
            )}
          </h4>
        </div>
        <OrderItemsTable 
          orderItems={orderItems} 
          onRemoveItem={handleRemoveItem} 
          calculateTotal={calculateTotal} 
          isEditMode={isEditMode} 
        />
      </CardContent>
    </Card>
  );
}
