
import React from 'react';
import { OrderItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onRemoveItem: (productId: string) => void;
  calculateTotal: () => number;
}

export default function OrderItemsTable({
  orderItems,
  onRemoveItem,
  calculateTotal
}: OrderItemsTableProps) {
  return (
    <>
      {orderItems.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Nenhum item adicionado ao pedido.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-center">Quantidade</th>
                <th className="px-4 py-2 text-right">Preço Unit.</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.productId} className="border-t">
                  <td className="px-4 py-3">{item.productName}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => onRemoveItem(item.productId)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                <td className="px-4 py-3 text-right font-bold">
                  {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
