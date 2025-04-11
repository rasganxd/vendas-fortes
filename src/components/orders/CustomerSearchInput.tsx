
import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Customer } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface CustomerSearchInputProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  onViewRecentPurchases: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onEnterPress?: () => void;
  compact?: boolean;
  initialInputValue?: string;
}

export default function CustomerSearchInput({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  onViewRecentPurchases,
  inputRef,
  onEnterPress,
  compact = false,
  initialInputValue = ''
}: CustomerSearchInputProps) {
  const [customerInput, setCustomerInput] = useState(initialInputValue);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Update customer input when initialInputValue changes
  useEffect(() => {
    if (initialInputValue && initialInputValue !== customerInput) {
      setCustomerInput(initialInputValue);
    }
  }, [initialInputValue]);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.code?.toString().includes(customerSearch)
  );

  const findCustomerByCode = (code: string) => {
    const foundCustomer = customers.find(c => c.code && c.code.toString() === code);
    if (foundCustomer) {
      setSelectedCustomer(foundCustomer);
      setCustomerInput(`${foundCustomer.code} - ${foundCustomer.name}`);
      return true;
    }
    return false;
  };

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerInput(value);
    
    // Check if input is just a code number
    const codeMatch = value.match(/^(\d+)$/);
    if (codeMatch) {
      findCustomerByCode(codeMatch[1]);
    } else if (!value) {
      setSelectedCustomer(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      
      // If we have a valid number but haven't selected a customer yet, try to find one
      const codeMatch = customerInput.match(/^(\d+)$/);
      if (codeMatch && !selectedCustomer) {
        const found = findCustomerByCode(codeMatch[1]);
        if (found) {
          // Give it a moment to set the state before moving to the next field
          setTimeout(() => {
            onEnterPress();
          }, 50);
          return;
        }
      }
      
      if (selectedCustomer) {
        onEnterPress();
      } else {
        setIsCustomerSearchOpen(true);
      }
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="customer">
            Cliente
          </Label>
          {selectedCustomer && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={onViewRecentPurchases}
            >
              <FileText size={14} className="mr-1" />
              Ver compras recentes
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              id="customer"
              placeholder="Digite o código do cliente"
              value={customerInput}
              onChange={handleCustomerInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className="w-full pr-10"
            />
            {selectedCustomer && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerInput('');
                }}
                className="absolute right-0 top-0 h-10 w-10"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => setIsCustomerSearchOpen(true)}
          >
            <Search size={18} />
          </Button>
        </div>
      </div>

      {/* Replace Popover with Dialog for customer search */}
      <Dialog open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Buscar cliente por código ou nome..." 
              value={customerSearch}
              onValueChange={setCustomerSearch}
            />
            <CommandList>
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup>
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      setSelectedCustomer(customer);
                      setCustomerInput(`${customer.code} - ${customer.name}`);
                      setIsCustomerSearchOpen(false);
                      setCustomerSearch('');
                      // Navigate to next field on selection
                      if (onEnterPress) {
                        setTimeout(onEnterPress, 50);
                      }
                    }}
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
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
