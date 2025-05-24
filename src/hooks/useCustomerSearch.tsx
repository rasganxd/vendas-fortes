
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';

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
    
    // Try to find customer by code
    const customer = customers.find(c => c.code?.toString() === value);
    if (customer) {
      setSelectedCustomer(customer);
    } else if (selectedCustomer) {
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
