
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
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-center">Qtde</th>
                <th className="px-4 py-2 text-center">Un</th>
                <th className="px-4 py-2 text-right">Valor Unit.</th>
                <th className="px-4 py-2 text-right">Valor Total</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.productId} className="border-t">
                  <td className="px-4 py-3">{item.productId.substring(0, 6) || '—'}</td>
                  <td className="px-4 py-3">{item.productName}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-center">un</td>
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
              <tr className="border-t bg-gray-50">
                <td colSpan={4} className="px-4 py-3 text-left">
                  <span className="font-medium">Itens: {orderItems.length}</span>
                  <span className="mx-4 text-gray-500">|</span>
                  <span className="font-medium">Qtde: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </td>
                <td colSpan={1} className="px-4 py-3 text-right font-semibold">Total:</td>
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
