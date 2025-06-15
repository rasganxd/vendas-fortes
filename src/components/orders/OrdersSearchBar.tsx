
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OrdersDateFilter from './OrdersDateFilter';
import { DatePeriod } from '@/types/dateFilter';

interface OrdersSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPeriod: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
  periodCounts?: Record<DatePeriod, number>;
}

const OrdersSearchBar: React.FC<OrdersSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm,
  selectedPeriod,
  onPeriodChange,
  periodCounts
}) => {
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
        
        <Button variant="outline" size="sm" className="flex gap-1 items-center">
          <Filter className="h-4 w-4" /> Mais filtros
        </Button>
      </div>
    </div>
  );
};

export default OrdersSearchBar;
