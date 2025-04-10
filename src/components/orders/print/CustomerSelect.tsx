
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
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomerSelect;
