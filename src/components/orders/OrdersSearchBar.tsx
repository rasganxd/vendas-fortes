
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OrdersDateFilter from './OrdersDateFilter';
import { DatePeriod } from '@/types/dateFilter';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import OrdersAdvancedFilters from './OrdersAdvancedFilters';
import { SalesRep, PaymentMethod, OrderAdvancedFilters } from '@/types';

interface OrdersSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPeriod: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
  periodCounts?: Record<DatePeriod, number>;
  advancedFilters: OrderAdvancedFilters;
  onAdvancedFilterChange: (filters: OrderAdvancedFilters) => void;
  salesReps: SalesRep[];
  paymentMethods: PaymentMethod[];
}

const OrdersSearchBar: React.FC<OrdersSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm,
  selectedPeriod,
  onPeriodChange,
  periodCounts,
  advancedFilters,
  onAdvancedFilterChange,
  salesReps,
  paymentMethods
}) => {
  const activeFilterCount = Object.values(advancedFilters).filter(
    (v) => v !== undefined && v !== '' && v !== null
  ).length;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar pedidos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <OrdersDateFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          periodCounts={periodCounts}
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-1 items-center">
              <Filter className="h-4 w-4" /> Mais filtros
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <OrdersAdvancedFilters
              filters={advancedFilters}
              onFilterChange={onAdvancedFilterChange}
              salesReps={salesReps}
              paymentMethods={paymentMethods}
              onClearFilters={() => onAdvancedFilterChange({})}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default OrdersSearchBar;
