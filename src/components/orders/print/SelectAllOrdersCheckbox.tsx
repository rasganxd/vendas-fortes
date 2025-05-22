
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Order } from '@/types';

interface SelectAllOrdersCheckboxProps {
  filteredOrders: Order[];
  selectedOrderIds: string[];
  handleSelectAllOrders: () => void;
}

const SelectAllOrdersCheckbox: React.FC<SelectAllOrdersCheckboxProps> = ({
  filteredOrders,
  selectedOrderIds,
  handleSelectAllOrders
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="selectAll" 
        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
        onCheckedChange={handleSelectAllOrders}
      />
      <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer">
        Selecionar todos os pedidos
      </label>
    </div>
  );
};

export default SelectAllOrdersCheckbox;
