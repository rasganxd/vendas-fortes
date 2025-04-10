
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomerSearchInputProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  onViewRecentPurchases: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onEnterPress?: () => void;
  compact?: boolean;
  initialInputValue?: string; // Add this prop
}

export default function CustomerSearchInput({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  onViewRecentPurchases,
  inputRef,
  onEnterPress,
  compact = false,
  initialInputValue = '' // Set default value
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
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="customer" className={compact ? "text-xs text-gray-500" : ""}>
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
          <Input
            type="text"
            id="customer"
            placeholder="Digite o código do cliente"
            value={customerInput}
            onChange={handleCustomerInputChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            className={`w-full ${compact ? "h-8 text-sm" : ""}`}
          />
          <Popover open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className={`shrink-0 ${compact ? "h-8 w-8" : ""}`}
              >
                <Search size={compact ? 14 : 18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
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
            </PopoverContent>
          </Popover>
          {selectedCustomer && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerInput('');
              }}
              className={`shrink-0 ${compact ? "h-8 w-8" : ""}`}
            >
              <X size={compact ? 14 : 18} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
