
import { useState, useMemo } from 'react';
import { Customer } from '@/types';

type SortByOption = 'name' | 'code' | 'salesRep' | 'visitFrequency';

export const useCustomerFilters = (customers: Customer[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortByOption>('name');
  const [salesRepFilter, setSalesRepFilter] = useState('all');

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...customers];

    if (salesRepFilter !== 'all') {
      filtered = filtered.filter(customer => customer.salesRepId === salesRepFilter);
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        (customer.name || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (customer.code || '').toString().includes(searchTerm) ||
        (customer.salesRepName || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (customer.phone || '').includes(searchTerm) ||
        (customer.city || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (customer.email || '').toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'code':
          return (a.code || 0) - (b.code || 0);
        case 'salesRep':
          return (a.salesRepName || 'z').localeCompare(b.salesRepName || 'z');
        case 'visitFrequency':
          return (a.visitFrequency || 'z').localeCompare(b.visitFrequency || 'z');
        default:
          return 0;
      }
    });

    return sorted;
  }, [customers, searchTerm, sortBy, salesRepFilter]);

  return {
    filteredCustomers: filteredAndSortedCustomers,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy: (value: string) => setSortBy(value as SortByOption),
    salesRepFilter,
    setSalesRepFilter,
  };
};
