
import React, { useState } from 'react';
import { OrderItem } from '@/types';
import OrderItemsTableHeader from './OrderItemsTableHeader';
import OrderItemsTableRow from './OrderItemsTableRow';
import OrderItemsTableFooter from './OrderItemsTableFooter';
import OrderItemsTableEmpty from './OrderItemsTableEmpty';

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
  const averageValue = filteredItems.length > 0 ? calculateTotal() / filteredItems.length : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <OrderItemsTableHeader
        itemCount={orderItems.length}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        isEditMode={isEditMode}
      />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <OrderItemsTableEmpty searchFilter={searchFilter} />
        ) : (
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-left">
                  <th className="w-20 px-4 py-3 font-semibold text-gray-700 text-sm">Código</th>
                  <th className="w-auto px-4 py-3 font-semibold text-gray-700 text-sm">Descrição</th>
                  <th className="w-16 px-4 py-3 font-semibold text-gray-700 text-sm text-center">Qtde</th>
                  <th className="w-16 px-4 py-3 font-semibold text-gray-700 text-sm text-center">Un</th>
                  <th className="w-24 px-4 py-3 font-semibold text-gray-700 text-sm text-right">Valor Unit.</th>
                  <th className="w-28 px-4 py-3 font-semibold text-gray-700 text-sm text-right">Valor Total</th>
                  <th className="w-20 px-4 py-3 font-semibold text-gray-700 text-sm text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <OrderItemsTableRow
                    key={getItemKey(item, index)}
                    item={item}
                    index={index}
                    isEditing={editingItem === item.id}
                    editValues={editValues}
                    setEditValues={setEditValues}
                    onStartEditing={startEditing}
                    onSaveEditing={saveEditing}
                    onCancelEditing={cancelEditing}
                    onRemove={handleRemoveClick}
                    isEditMode={isEditMode}
                    getItemKey={getItemKey}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Fixed Footer */}
      {filteredItems.length > 0 && (
        <OrderItemsTableFooter
          filteredItemsCount={filteredItems.length}
          totalQuantity={totalQuantity}
          averageValue={averageValue}
          totalValue={calculateTotal()}
          searchFilter={searchFilter}
        />
      )}
    </div>
  );
}
