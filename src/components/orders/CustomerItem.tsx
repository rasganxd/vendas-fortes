
import React from 'react';
import { Customer } from '@/types';
import { CommandItem } from "@/components/ui/command";

interface CustomerItemProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
}

export default function CustomerItem({ customer, onSelect }: CustomerItemProps) {
  return (
    <CommandItem
      key={customer.id}
      value={customer.id}
      onSelect={() => onSelect(customer)}
      className="cursor-pointer py-2 px-2"
    >
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-medium mr-2">
            {customer.code || "---"}
          </span>
          <span className="font-medium">{customer.name}</span>
        </div>
        <span className="text-xs text-gray-500 ml-7">
          {customer.city}{customer.state ? `, ${customer.state}` : ''}
        </span>
      </div>
    </CommandItem>
  );
}
