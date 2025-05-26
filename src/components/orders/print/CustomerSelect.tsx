
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
  console.log("CustomerSelect rendering with customers:", customers);
  console.log("Customer IDs:", customers.map(c => ({ name: c.name, id: c.id, idType: typeof c.id })));

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
            
            console.log(`Customer: ${customer.name}, Original ID: "${customer.id}", Generated Value: "${customerValue}"`);
            
            // Double-check the value is not empty
            if (!customerValue || customerValue.trim() === '') {
              console.error(`CRITICAL: Empty value detected for customer ${customer.name}`);
              return null; // Skip this item entirely if we can't generate a valid value
            }
            
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
