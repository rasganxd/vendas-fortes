
import { useState, KeyboardEvent, useEffect } from 'react';
import { Customer } from '@/types';

interface UseCustomerSearchProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  initialInputValue?: string;
  onEnterPress?: () => void;
}

export function useCustomerSearch({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  initialInputValue = '',
  onEnterPress
}: UseCustomerSearchProps) {
  const [customerInput, setCustomerInput] = useState(initialInputValue);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Update customer input when initialInputValue changes
  useEffect(() => {
    if (initialInputValue && initialInputValue !== customerInput) {
      setCustomerInput(initialInputValue);
    }
  }, [initialInputValue]);

  // Filter customers by name or code
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.code !== undefined && customer.code.toString().includes(customerSearch))
  );

  // Find a customer by exact code match
  const findCustomerByCode = (codeStr: string) => {
    // Convert input to number for comparison
    const codeNum = parseInt(codeStr, 10);
    
    // Check for NaN after parseInt
    if (isNaN(codeNum)) return false;
    
    // Find customer with matching code
    const foundCustomer = customers.find(c => c.code === codeNum);
    
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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerInput(`${customer.code} - ${customer.name}`);
    setIsCustomerSearchOpen(false);
    setCustomerSearch('');
    
    // Navigate to next field on selection
    if (onEnterPress) {
      setTimeout(onEnterPress, 50);
    }
  };

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
}
