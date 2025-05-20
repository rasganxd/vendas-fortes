
import { useState, KeyboardEvent, useEffect } from 'react';
import { Customer } from '@/types';
import { getCustomerByCode } from '@/services/firebase/customerService';

interface UseCustomerSearchProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  initialInputValue?: string;
  onEnterPress?: () => void;
}

// Cache for customer search results
const customerSearchCache = new Map<string, Customer[]>();

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

  // Enhanced customer filtering with caching
  const getFilteredCustomers = () => {
    if (!customerSearch) return customers;
    
    // Check cache first
    const cacheKey = customerSearch.toLowerCase();
    if (customerSearchCache.has(cacheKey)) {
      return customerSearchCache.get(cacheKey) || [];
    }
    
    // Filter customers by name or code
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer.code !== undefined && customer.code.toString().includes(customerSearch))
    );
    
    // Store in cache (limit cache size)
    if (customerSearchCache.size > 50) {
      const firstKey = customerSearchCache.keys().next().value;
      customerSearchCache.delete(firstKey);
    }
    customerSearchCache.set(cacheKey, filtered);
    
    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  // Find a customer by exact code match with optimized logic
  const findCustomerByCode = async (codeStr: string) => {
    // Convert input to number for comparison
    const codeNum = parseInt(codeStr, 10);
    
    // Check for NaN after parseInt
    if (isNaN(codeNum)) return false;
    
    // First check local customer list
    const foundCustomer = customers.find(c => c.code === codeNum);
    
    if (foundCustomer) {
      setSelectedCustomer(foundCustomer);
      setCustomerInput(`${foundCustomer.code} - ${foundCustomer.name}`);
      return true;
    } else {
      // If not found locally, try fetching from API
      try {
        const apiCustomer = await getCustomerByCode(codeNum);
        if (apiCustomer) {
          setSelectedCustomer(apiCustomer);
          setCustomerInput(`${apiCustomer.code} - ${apiCustomer.name}`);
          return true;
        }
      } catch (error) {
        // Handle silently, will return false below
      }
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
        findCustomerByCode(codeMatch[1]).then(found => {
          if (found && onEnterPress) {
            // Move to next field if customer found
            onEnterPress();
          } else if (!found) {
            setIsCustomerSearchOpen(true);
          }
        });
        return;
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
      onEnterPress();
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
