
import React from 'react';
import { Customer } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerSelectProps {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  customers: Customer[];
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  selectedCustomerId,
  setSelectedCustomerId,
  customers
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Filtrar por Cliente</label>
      <Select
        value={selectedCustomerId}
        onValueChange={(value) => setSelectedCustomerId(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {customers.map((customer) => {
            // Ensure we never have an empty string as value
            const customerValue = customer.id && customer.id.trim() !== '' 
              ? customer.id 
              : `customer-${customer.name}-${Math.random().toString(36).substr(2, 9)}`;
            
            return (
              <SelectItem 
                key={customer.id || `customer-${customer.name}`} 
                value={customerValue}
              >
                {customer.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomerSelect;
