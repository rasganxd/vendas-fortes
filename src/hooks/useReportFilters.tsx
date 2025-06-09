
import { useState } from 'react';
import { ReportFilters } from '@/types/reports';

export const useReportFilters = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    salesRepId: null,
    customerId: null,
    periodPreset: 'month',
    dateRange: null,
    orderStatus: 'all',
    minValue: null,
    maxValue: null
  });

  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(filters);

  const updateFilter = (key: keyof ReportFilters, value: any) => {
    console.log(`🔄 [useReportFilters] Updating filter ${key}:`, value);
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Aplicar filtros automaticamente
    setAppliedFilters(newFilters);
  };

  const resetFilters = () => {
    console.log('🔄 [useReportFilters] Resetting all filters');
    
    const defaultFilters: ReportFilters = {
      salesRepId: null,
      customerId: null,
      periodPreset: 'month',
      dateRange: null,
      orderStatus: 'all',
      minValue: null,
      maxValue: null
    };
    
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return {
    filters,
    appliedFilters,
    updateFilter,
    resetFilters
  };
};
