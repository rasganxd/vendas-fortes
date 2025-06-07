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

  // Compact currency formatter
  const formatCompactCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace('R$', '').trim();
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
                <th className="px-1 py-1 text-left font-medium text-gray-700 text-xs w-12 hidden sm:table-cell">Cód</th>
                <th className="px-1 py-1 text-left font-medium text-gray-700 text-xs flex-1 min-w-0">Produto</th>
                <th className="px-1 py-1 text-center font-medium text-gray-700 text-xs w-8">Qt</th>
                <th className="px-1 py-1 text-center font-medium text-gray-700 text-xs w-8">Un</th>
                <th className="px-1 py-1 text-right font-medium text-gray-700 text-xs w-16">Vlr</th>
                <th className="px-1 py-1 text-right font-medium text-gray-700 text-xs w-16">Total</th>
                <th className="px-1 py-1 text-center font-medium text-gray-700 text-xs w-8"></th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => {
                console.log(`🏷️ Displaying item: ${item.productName}, unit: ${item.unit}`);
                return (
                  <tr key={getItemKey(item, index)} className="border-t hover:bg-gray-50">
                    <td className="px-1 py-1 text-gray-800 text-xs font-mono w-12 hidden sm:table-cell">{item.productCode || '—'}</td>
                    <td className="px-1 py-1 text-gray-800 font-medium text-xs min-w-0 flex-1">
                      <div className="break-words leading-tight">
                        {item.productName}
                      </div>
                    </td>
                    <td className="px-1 py-1 text-center text-gray-800 text-xs w-8">{item.quantity}</td>
                    <td className="px-1 py-1 text-center text-gray-600 text-xs w-8">
                      {item.unit && item.unit.trim() !== '' ? item.unit : 'UN'}
                    </td>
                    <td className="px-1 py-1 text-right text-gray-800 text-xs w-16">
                      <div className="text-xs">
                        {formatCompactCurrency(item.unitPrice || item.price || 0)}
                      </div>
                    </td>
                    <td className="px-1 py-1 text-right font-semibold text-gray-900 text-xs w-16">
                      <div className="text-xs">
                        {formatCompactCurrency((item.unitPrice || item.price || 0) * item.quantity)}
                      </div>
                    </td>
                    <td className="px-1 py-1 text-center w-8">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveClick(item, index)}
                        type="button"
                        className="hover:bg-red-50 hover:text-red-600 transition-colors h-5 w-5 p-0"
                        title={`Remover ${item.productName} (${item.unit || 'UN'}) do pedido`}
                      >
                        <Trash2 size={10} className="text-red-500 hover:text-red-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-50">
                <td colSpan={2} className="px-1 py-1 text-left">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-gray-700">{orderItems.length} itens</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-semibold text-gray-700">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)} un
                    </span>
                  </div>
                </td>
                <td colSpan={2} className="px-1 py-1 text-right font-semibold text-gray-700 text-xs">Total:</td>
                <td className="px-1 py-1 text-right font-bold text-sm text-gray-900">
                  R$ {formatCompactCurrency(calculateTotal())}
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
