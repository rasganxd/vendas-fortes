
import React from 'react';
import { Customer } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useCustomerSearch } from '@/hooks/useCustomerSearch';
import CustomerSearchDialog from './CustomerSearchDialog';

interface CustomerSearchInputProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onEnterPress?: () => void;
  compact?: boolean;
  initialInputValue?: string;
}

export default function CustomerSearchInput({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  inputRef,
  onEnterPress,
  compact = false,
  initialInputValue = ''
}: CustomerSearchInputProps) {
  const {
    customerInput,
    setCustomerInput,
    isCustomerSearchOpen,
    setIsCustomerSearchOpen,
    customerSearch,
    setCustomerSearch,
    filteredCustomers,
    handleCustomerInputChange,
    handleKeyDown,
    handleCustomerSelect
  } = useCustomerSearch({
    customers,
    selectedCustomer,
    setSelectedCustomer,
    initialInputValue,
    onEnterPress
  });

  const displayValue = selectedCustomer 
    ? (selectedCustomer.code ? `${selectedCustomer.code} - ${selectedCustomer.name}` : selectedCustomer.name)
    : customerInput;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="customer" className="text-sm font-medium text-gray-700">
          Cliente
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              id="customer"
              placeholder="Digite o código do cliente"
              value={displayValue}
              onChange={handleCustomerInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className="w-full pr-10 h-10"
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
            className="h-10 w-10"
          >
            <Search size={18} />
          </Button>
        </div>
      </div>

      <CustomerSearchDialog
        open={isCustomerSearchOpen}
        onOpenChange={setIsCustomerSearchOpen}
        customers={filteredCustomers}
        customerSearch={customerSearch}
        onSearchChange={setCustomerSearch}
        onSelectCustomer={handleCustomerSelect}
      />
    </>
  );
}
