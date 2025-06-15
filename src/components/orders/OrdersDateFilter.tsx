
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { DatePeriod, DateFilterOption } from '@/types/dateFilter';
import { getDateRangeLabel } from '@/lib/date-utils';

interface OrdersDateFilterProps {
  selectedPeriod: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
  periodCounts?: Record<DatePeriod, number>;
}

const dateFilterOptions: DateFilterOption[] = [
  { value: 'all', label: 'Todos os períodos' },
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_week', label: 'Semana passada' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' }
];

const OrdersDateFilter: React.FC<OrdersDateFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  periodCounts
}) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          {dateFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {periodCounts && periodCounts[option.value] !== undefined && (
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {periodCounts[option.value]}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrdersDateFilter;
