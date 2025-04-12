
import React from 'react';
import { Customer } from '@/types';
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList
} from "@/components/ui/command";
import CustomerItem from './CustomerItem';

interface CustomerSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  customerSearch: string;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerSearchDialog({
  open,
  onOpenChange,
  customers,
  customerSearch,
  onSearchChange,
  onSelectCustomer
}: CustomerSearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Buscar cliente por código ou nome..." 
            value={customerSearch}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CustomerItem 
                  key={customer.id} 
                  customer={customer} 
                  onSelect={onSelectCustomer} 
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
