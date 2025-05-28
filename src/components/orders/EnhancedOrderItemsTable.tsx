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
  const [editValues, setEditValues] = useState<{ quantity: number; price: number }>({ quantity: 0, price: 0 });

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
    setEditValues({ quantity: 0, price: 0 });
  };

  const saveEditing = (item: OrderItem) => {
    // Here you would typically call an update function
    // For now, we'll just cancel editing since update logic would need to be implemented
    cancelEditing();
  };

  const filteredItems = orderItems.filter(item => 
    !searchFilter || 
    item.productName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.productCode?.toString().includes(searchFilter)
  );

  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Itens do Pedido
            <Badge variant="secondary" className="ml-2">
              {orderItems.length} {orderItems.length === 1 ? 'item' : 'itens'}
            </Badge>
          </h4>
          
          {orderItems.length > 3 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Filtrar itens..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 w-64 h-8 text-sm"
              />
            </div>
          )}
        </div>
        
        {isEditMode && (
          <div className="mt-2 text-sm text-blue-600">
            💡 Clique no ícone de edição para alterar quantidade ou preço
          </div>
        )}
      </div>

      {/* Scrollable content area - MELHORADO overflow */}
      <div className="flex-1" style={{ overflowY: 'auto', overflowX: 'visible' }}>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {searchFilter ? (
              <div>
                <div className="text-lg mb-2">Nenhum item encontrado</div>
                <div className="text-sm">Ajuste o filtro de busca ou adicione novos produtos</div>
              </div>
            ) : (
              <div>
                <div className="text-lg mb-2">Nenhum item adicionado ao pedido</div>
                <div className="text-sm">Use a busca de produtos acima para adicionar itens</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Código</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm">Descrição</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm text-center">Qtde</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm text-center">Un</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm text-right">Valor Unit.</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm text-right">Valor Total</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-sm text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const isEditing = editingItem === item.id;
                  const itemKey = getItemKey(item, index);
                  
                  return (
                    <tr key={itemKey} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-gray-800 font-mono">
                        {item.productCode || '—'}
                      </td>
                      <td className="px-4 py-4 text-gray-800 font-medium">
                        <div className="max-w-xs truncate" title={item.productName}>
                          {item.productName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.quantity}
                            onChange={(e) => setEditValues(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                            className="w-20 h-8 text-center"
                            min="0"
                            step="1"
                          />
                        ) : (
                          <span className="font-semibold text-gray-800">{item.quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge variant="outline" className="text-xs">
                          {item.unit || 'UN'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isEditing ? (
                          <Input
                            type="text"
                            value={editValues.price.toFixed(2).replace('.', ',')}
                            onChange={(e) => {
                              const value = e.target.value.replace(',', '.');
                              setEditValues(prev => ({ ...prev, price: parseFloat(value) || 0 }));
                            }}
                            className="w-24 h-8 text-right"
                          />
                        ) : (
                          <span className="text-gray-800 font-medium">
                            {(item.unitPrice || item.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-gray-900 text-lg">
                          {((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => saveEditing(item)}
                                className="hover:bg-green-50 hover:text-green-600"
                                title="Salvar alterações"
                              >
                                <Check size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={cancelEditing}
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
                                  onClick={() => startEditing(item)}
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  title="Editar item"
                                >
                                  <Edit2 size={16} />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveClick(item, index)}
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Fixed Footer */}
      {filteredItems.length > 0 && (
        <div className="border-t-2 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <div className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Left: Items summary */}
              <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                <span>Produtos: {filteredItems.length}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Qtde Total: {totalQuantity}</span>
                {searchFilter && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <Badge variant="secondary" className="text-xs">
                      Filtrado
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Center: Average value */}
              <div className="text-center text-sm text-gray-600">
                Valor médio: {filteredItems.length > 0 
                  ? (calculateTotal() / filteredItems.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0,00'
                }
              </div>
              
              {/* Right: Total */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Total Geral</div>
                <div className="text-2xl font-bold text-green-600">
                  {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
