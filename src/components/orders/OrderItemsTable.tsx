import React from 'react';
import { OrderItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onRemoveItem: (productId: string) => void;
  calculateTotal: () => number;
  isEditMode?: boolean;
}

export default function OrderItemsTable({
  orderItems,
  onRemoveItem,
  calculateTotal,
  isEditMode = false
}: OrderItemsTableProps) {
  // Generate a stable key for an item - use ID if available or create a composite key
  const getItemKey = (item: OrderItem, index: number) => {
    // If the item has an ID, use that (most reliable)
    if (item.id) {
      return item.id;
    }
    // Otherwise use a composite key with productId, unit and index
    return `${item.productId}-${item.unit || 'UN'}-${index}`;
  };

  const handleRemoveClick = (item: OrderItem, index: number) => {
    console.log("🗑️ === REMOVE BUTTON CLICKED ===");
    console.log("🗑️ Item details:", {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      unit: item.unit,
      index: index
    });
    
    // Try to use productId first, then fallback to id
    const removeKey = item.productId || item.id;
    
    if (!removeKey) {
      console.error("❌ No valid key found for item removal:", item);
      return;
    }
    
    console.log("🎯 Using remove key:", removeKey);
    
    try {
      onRemoveItem(removeKey);
    } catch (error) {
      console.error("❌ Error calling onRemoveItem:", error);
    }
  };

  return (
    <>
      {orderItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">Nenhum item adicionado ao pedido</div>
          <div className="text-sm">Use a busca de produtos acima para adicionar itens</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Qtde</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Un</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Valor Unit.</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Valor Total</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={getItemKey(item, index)} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{item.productCode || '—'}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{item.quantity}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.unit || 'UN'}</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {(item.unitPrice || item.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveClick(item, index)}
                      type="button"
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                      title={`Remover ${item.productName} (${item.unit || 'UN'}) do pedido`}
                    >
                      <Trash2 size={16} className="text-red-500 hover:text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-50">
                <td colSpan={4} className="px-4 py-4 text-left">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-gray-700">Itens: {orderItems.length}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-semibold text-gray-700">
                      Qtde Total: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-semibold text-gray-700">Total Geral:</td>
                <td className="px-4 py-4 text-right font-bold text-lg text-gray-900">
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
