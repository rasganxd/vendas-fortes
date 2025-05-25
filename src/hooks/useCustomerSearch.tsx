
import { useState, useEffect } from 'react';
import { Customer } from '@/types';

interface UseCustomerSearchProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  initialInputValue?: string;
  onEnterPress?: () => void;
}

export const useCustomerSearch = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  initialInputValue = '',
  onEnterPress
}: UseCustomerSearchProps) => {
  const [customerInput, setCustomerInput] = useState(initialInputValue);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.code?.toString().includes(customerSearch) ||
    customer.phone?.includes(customerSearch) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerInput(value);
    
    // Extract just the code part if it's in the format "code - name"
    const codeMatch = value.match(/^(\d+)/);
    const codeValue = codeMatch ? codeMatch[1] : value;
    
    // Try to find customer by code
    const customer = customers.find(c => c.code?.toString() === codeValue);
    if (customer) {
      console.log('🎯 Customer found by code:', customer.code, '-', customer.name);
      setSelectedCustomer(customer);
    } else if (selectedCustomer && !value.includes(selectedCustomer.name)) {
      // Clear selection if user is typing something that doesn't match current selection
      setSelectedCustomer(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnterPress) {
      onEnterPress();
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerInput(customer.code ? `${customer.code} - ${customer.name}` : customer.name);
    setIsCustomerSearchOpen(false);
    setCustomerSearch('');
  };

  // Update input when selectedCustomer changes externally
  useEffect(() => {
    if (selectedCustomer) {
      const displayValue = selectedCustomer.code 
        ? `${selectedCustomer.code} - ${selectedCustomer.name}` 
        : selectedCustomer.name;
      setCustomerInput(displayValue);
    }
  }, [selectedCustomer]);

  return {
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
  };
};
