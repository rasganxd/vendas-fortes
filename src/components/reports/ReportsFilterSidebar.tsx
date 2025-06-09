
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useCustomers } from '@/hooks/useCustomers';
import { ReportFilters } from '@/types/reports';

interface ReportsFilterSidebarProps {
  filters: ReportFilters;
  onFilterChange: (key: keyof ReportFilters, value: any) => void;
  onResetFilters: () => void;
  appliedFilters: ReportFilters;
}

const ReportsFilterSidebar: React.FC<ReportsFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  appliedFilters
}) => {
  const { salesReps } = useSalesReps();
  const { customers } = useCustomers();

  const periodPresets = [
    { label: 'Hoje', value: 'today' },
    { label: 'Última Semana', value: 'week' },
    { label: 'Último Mês', value: 'month' },
    { label: 'Último Trimestre', value: 'quarter' },
    { label: 'Último Ano', value: 'year' },
    { label: 'Personalizado', value: 'custom' }
  ];

  const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendente', value: 'pending' },
    { label: 'Confirmado', value: 'confirmed' },
    { label: 'Concluído', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' }
  ];

  const appliedFiltersCount = Object.values(appliedFilters).filter(value => 
    value !== null && value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const handleRemoveFilter = (key: keyof ReportFilters) => {
    onFilterChange(key, null);
  };

  console.log('🔄 [ReportsFilterSidebar] Current filters:', filters);
  console.log('📊 [ReportsFilterSidebar] Applied filters count:', appliedFiltersCount);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {appliedFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {appliedFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtro por Vendedor */}
        <div className="space-y-2">
          <Label htmlFor="salesRep">Vendedor</Label>
          <Select
            value={filters.salesRepId || ''}
            onValueChange={(value) => onFilterChange('salesRepId', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os vendedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os vendedores</SelectItem>
              {salesReps?.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Período */}
        <div className="space-y-2">
          <Label>Período</Label>
          <Select
            value={filters.periodPreset || ''}
            onValueChange={(value) => onFilterChange('periodPreset', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              {periodPresets.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.periodPreset === 'custom' && (
            <div className="mt-2">
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => onFilterChange('dateRange', range)}
              />
            </div>
          )}
        </div>

        {/* Filtro por Status */}
        <div className="space-y-2">
          <Label>Status do Pedido</Label>
          <Select
            value={filters.orderStatus || 'all'}
            onValueChange={(value) => onFilterChange('orderStatus', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Cliente */}
        <div className="space-y-2">
          <Label htmlFor="customer">Cliente</Label>
          <Select
            value={filters.customerId || ''}
            onValueChange={(value) => onFilterChange('customerId', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os clientes</SelectItem>
              {customers?.slice(0, 50).map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Valor */}
        <div className="space-y-2">
          <Label>Range de Valores</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Mín"
                value={filters.minValue || ''}
                onChange={(e) => onFilterChange('minValue', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Máx"
                value={filters.maxValue || ''}
                onChange={(e) => onFilterChange('maxValue', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>
        </div>

        {/* Filtros Aplicados */}
        {appliedFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros Aplicados:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.salesRepId && (
                <Badge variant="outline" className="text-xs">
                  Vendedor
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleRemoveFilter('salesRepId')}
                  />
                </Badge>
              )}
              {filters.periodPreset && (
                <Badge variant="outline" className="text-xs">
                  Período
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleRemoveFilter('periodPreset')}
                  />
                </Badge>
              )}
              {filters.customerId && (
                <Badge variant="outline" className="text-xs">
                  Cliente
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleRemoveFilter('customerId')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsFilterSidebar;
