import React, { useState } from 'react';
import { OrderItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Check, X, Search } from "lucide-react";
import { Separator } from '@/components/ui/separator';
interface EnhancedOrderItemsTableProps {
  orderItems: OrderItem[];
  handleRemoveItem: (productId: string) => void;
  calculateTotal: () => number;
  isEditMode?: boolean;
}
export default function EnhancedOrderItemsTable({
  orderItems,
  handleRemoveItem,
  calculateTotal,
  isEditMode = false
}: EnhancedOrderItemsTableProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [editValues, setEditValues] = useState<{
    quantity: number;
    price: number;
  }>({
    quantity: 0,
    price: 0
  });
  const getItemKey = (item: OrderItem, index: number) => {
    if (item.id) {
      return item.id;
    }
    return `${item.productId}-${item.unit || 'UN'}-${index}`;
  };
  const handleRemoveClick = (item: OrderItem, index: number) => {
    const removeKey = item.productId || item.id;
    if (!removeKey) {
      console.error("❌ No valid key found for item removal:", item);
      return;
    }
    handleRemoveItem(removeKey);
  };
  const startEditing = (item: OrderItem) => {
    setEditingItem(item.id || '');
    setEditValues({
      quantity: item.quantity,
      price: item.unitPrice || item.price
    });
  };
  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({
      quantity: 0,
      price: 0
    });
  };
  const saveEditing = (item: OrderItem) => {
    // Here you would typically call an update function
    // For now, we'll just cancel editing since update logic would need to be implemented
    cancelEditing();
  };
  const filteredItems = orderItems.filter(item => !searchFilter || item.productName.toLowerCase().includes(searchFilter.toLowerCase()) || item.productCode?.toString().includes(searchFilter));
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="space-y-4">
      {/* Header with search */}
      <div className="px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            Itens do Pedido
            <Badge variant="secondary" className="ml-2 text-xs">
              {orderItems.length} {orderItems.length === 1 ? 'item' : 'itens'}
            </Badge>
          </h4>
          
          {orderItems.length > 3 && <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <Input type="text" placeholder="Filtrar itens..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} className="pl-7 w-56 h-7 text-xs" />
            </div>}
        </div>
        
        {isEditMode && <div className="mt-1 text-xs text-blue-600">
            💡 Clique no ícone de edição para alterar quantidade ou preço
          </div>}
      </div>

      {filteredItems.length === 0 ? <div className="text-center py-12 text-gray-500">
          {searchFilter ? <div>
              <div className="text-base mb-2">Nenhum item encontrado</div>
              <div className="text-xs">Ajuste o filtro de busca ou adicione novos produtos</div>
            </div> : <div>
              <div className="text-base mb-2">Nenhum item adicionado ao pedido</div>
              <div className="text-xs">Use a busca de produtos acima para adicionar itens</div>
            </div>}
        </div> : <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs">Código</th>
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs">Descrição</th>
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs text-center">Qtde</th>
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs text-center">Un</th>
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs text-right">Valor Unit.</th>
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs text-right">Valor Total</th>
                <th className="px-2 py-2 font-semibold text-gray-700 text-xs text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
            const isEditing = editingItem === item.id;
            const itemKey = getItemKey(item, index);
            return <tr key={itemKey} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="text-gray-800 font-mono px-2 py-2 text-xs">
                      {item.productCode || '—'}
                    </td>
                    <td className="text-gray-800 font-medium py-2 px-2 text-xs">
                      <div className="max-w-xs truncate" title={item.productName}>
                        {item.productName}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      {isEditing ? <Input type="number" value={editValues.quantity} onChange={e => setEditValues(prev => ({
                  ...prev,
                  quantity: parseFloat(e.target.value) || 0
                }))} className="w-16 h-6 text-center text-xs" min="0" step="1" /> : <span className="font-semibold text-gray-800 text-xs">{item.quantity}</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {item.unit || 'UN'}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {isEditing ? <Input type="text" value={editValues.price.toFixed(2).replace('.', ',')} onChange={e => {
                  const value = e.target.value.replace(',', '.');
                  setEditValues(prev => ({
                    ...prev,
                    price: parseFloat(value) || 0
                  }));
                }} className="w-20 h-6 text-right text-xs" /> : <span className="text-gray-800 font-medium text-xs">
                          {(item.unitPrice || item.price || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                        </span>}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span className="font-bold text-gray-900 text-xs">
                        {((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {isEditing ? <>
                            <Button variant="ghost" size="sm" onClick={() => saveEditing(item)} className="hover:bg-green-50 hover:text-green-600 h-6 w-6 p-0" title="Salvar alterações">
                              <Check size={12} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEditing} className="hover:bg-gray-50 hover:text-gray-600 h-6 w-6 p-0" title="Cancelar edição">
                              <X size={12} />
                            </Button>
                          </> : <>
                            {isEditMode && <Button variant="ghost" size="sm" onClick={() => startEditing(item)} className="hover:bg-blue-50 hover:text-blue-600 h-6 w-6 p-0" title="Editar item">
                                <Edit2 size={12} />
                              </Button>}
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveClick(item, index)} type="button" className="hover:bg-red-50 hover:text-red-600 h-6 w-6 p-0" title={`Remover ${item.productName}`}>
                              <Trash2 size={12} />
                            </Button>
                          </>}
                      </div>
                    </td>
                  </tr>;
          })}
            </tbody>
          </table>
          
          {/* Enhanced Footer */}
          <div className="border-t-2 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="px-3 py-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                {/* Left: Items summary */}
                
                
                {/* Center: Average value */}
                
                
                {/* Right: Total */}
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-600">Total Geral</div>
                  <div className="text-lg font-bold text-green-600">
                    {calculateTotal().toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}