
import React from 'react';
import { OrderItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Check, X } from "lucide-react";

interface OrderItemsTableRowProps {
  item: OrderItem;
  index: number;
  isEditing: boolean;
  editValues: { quantity: number; price: number };
  setEditValues: (values: { quantity: number; price: number }) => void;
  onStartEditing: (item: OrderItem) => void;
  onSaveEditing: (item: OrderItem) => void;
  onCancelEditing: () => void;
  onRemove: (item: OrderItem, index: number) => void;
  isEditMode: boolean;
  getItemKey: (item: OrderItem, index: number) => string;
}

export default function OrderItemsTableRow({
  item,
  index,
  isEditing,
  editValues,
  setEditValues,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onRemove,
  isEditMode,
  getItemKey
}: OrderItemsTableRowProps) {
  const itemKey = getItemKey(item, index);
  
  return (
    <tr key={itemKey} className="border-t hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 text-gray-800 font-mono text-sm w-20">
        {item.productCode || '—'}
      </td>
      <td className="px-4 py-4 text-gray-800 font-medium">
        <div className="truncate pr-2" title={item.productName}>
          {item.productName}
        </div>
      </td>
      <td className="px-4 py-4 text-center w-16">
        {isEditing ? (
          <Input
            type="number"
            value={editValues.quantity}
            onChange={(e) => setEditValues(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
            className="w-full h-8 text-center"
            min="0"
            step="1"
          />
        ) : (
          <span className="font-semibold text-gray-800">{item.quantity}</span>
        )}
      </td>
      <td className="px-4 py-4 text-center w-16">
        <Badge variant="outline" className="text-xs">
          {item.unit || 'UN'}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right w-24">
        {isEditing ? (
          <Input
            type="text"
            value={editValues.price.toFixed(2).replace('.', ',')}
            onChange={(e) => {
              const value = e.target.value.replace(',', '.');
              setEditValues(prev => ({ ...prev, price: parseFloat(value) || 0 }));
            }}
            className="w-full h-8 text-right"
          />
        ) : (
          <span className="text-gray-800 font-medium text-sm">
            {(item.unitPrice || item.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-right w-28">
        <span className="font-bold text-gray-900 text-sm">
          {((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </td>
      <td className="px-4 py-4 text-center w-20">
        <div className="flex items-center justify-center space-x-1">
          {isEditing ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSaveEditing(item)}
                className="hover:bg-green-50 hover:text-green-600"
                title="Salvar alterações"
              >
                <Check size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCancelEditing}
                className="hover:bg-gray-50 hover:text-gray-600"
                title="Cancelar edição"
              >
                <X size={16} />
              </Button>
            </>
          ) : (
            <>
              {isEditMode && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onStartEditing(item)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                  title="Editar item"
                >
                  <Edit2 size={16} />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemove(item, index)}
                type="button"
                className="hover:bg-red-50 hover:text-red-600"
                title={`Remover ${item.productName}`}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
