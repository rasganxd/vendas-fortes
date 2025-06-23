
import React from 'react';
import { Calendar, X, Filter, Search, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ReportFilters } from '@/types/reports';
import { SalesRep, Customer } from '@/types';
import { formatCurrency } from '@/lib/format-utils';

interface EnhancedReportsFilterSidebarProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  onClearFilters: () => void;
  salesReps: SalesRep[];
  customers: Customer[];
}

export const EnhancedReportsFilterSidebar: React.FC<EnhancedReportsFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  salesReps,
  customers
}) => {
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.salesRepId) count++;
    if (filters.customerId) count++;
    if (filters.orderStatus) count++;
    if (filters.minValue !== undefined) count++;
    if (filters.maxValue !== undefined) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const [customerSearch, setCustomerSearch] = React.useState('');
  const [salesRepSearch, setSalesRepSearch] = React.useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 50);

  const filteredSalesReps = salesReps.filter(rep =>
    rep.name.toLowerCase().includes(salesRepSearch.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter size={18} />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4 text-sm">
        {/* Período */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Calendar size={14} />
            Período
          </Label>
          <Select
            value={filters.period || 'month'}
            onValueChange={(value) => onFiltersChange({ 
              period: value === 'all' ? undefined : value as ReportFilters['period'],
              startDate: undefined,
              endDate: undefined
            })}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="last_week">Semana Passada</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="last_month">Mês Passado</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
              <SelectItem value="all">Todos os Períodos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Datas personalizadas */}
        {filters.period === 'custom' && (
          <div className="space-y-2 bg-blue-50 p-3 rounded-md">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data Inicial</Label>
              <Input
                type="date"
                className="h-8"
                value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onFiltersChange({ 
                  startDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data Final</Label>
              <Input
                type="date"
                className="h-8"
                value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onFiltersChange({ 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Vendedor com busca */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Users size={14} />
            Vendedor
          </Label>
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Buscar vendedor..."
                className="h-8 pl-7"
                value={salesRepSearch}
                onChange={(e) => setSalesRepSearch(e.target.value)}
              />
            </div>
            <Select
              value={filters.salesRepId || 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  onFiltersChange({ 
                    salesRepId: undefined,
                    salesRepName: undefined
                  });
                } else {
                  const salesRep = salesReps.find(rep => rep.id === value);
                  onFiltersChange({ 
                    salesRepId: value,
                    salesRepName: salesRep?.name || undefined
                  });
                }
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos os vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {filteredSalesReps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cliente com busca */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Package size={14} />
            Cliente
          </Label>
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                className="h-8 pl-7"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            <Select
              value={filters.customerId || 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  onFiltersChange({ 
                    customerId: undefined,
                    customerName: undefined
                  });
                } else {
                  const customer = customers.find(cust => cust.id === value);
                  onFiltersChange({ 
                    customerId: value,
                    customerName: customer?.name || undefined
                  });
                }
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {filteredCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status do Pedido com múltipla seleção */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <TrendingUp size={14} />
            Status do Pedido
          </Label>
          <Select
            value={filters.orderStatus || 'all'}
            onValueChange={(value) => onFiltersChange({ 
              orderStatus: value === 'all' ? undefined : value 
            })}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Faixa de Valor */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Faixa de Valor</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500">Mínimo</Label>
              <Input
                type="number"
                placeholder="0,00"
                className="h-8"
                value={filters.minValue || ''}
                onChange={(e) => onFiltersChange({ 
                  minValue: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Máximo</Label>
              <Input
                type="number"
                placeholder="999999,00"
                className="h-8"
                value={filters.maxValue || ''}
                onChange={(e) => onFiltersChange({ 
                  maxValue: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Filtros Rápidos</Label>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => onFiltersChange({ 
                period: 'today',
                startDate: undefined,
                endDate: undefined
              })}
            >
              Hoje
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => onFiltersChange({ 
                period: 'week',
                startDate: undefined,
                endDate: undefined
              })}
            >
              Semana
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => onFiltersChange({ 
                orderStatus: 'completed'
              })}
            >
              Concluídos
            </Button>
          </div>
        </div>

        {/* Filtros ativos */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-medium">Filtros Ativos</Label>
              <div className="flex flex-wrap gap-1">
                {filters.salesRepName && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Vendedor: {filters.salesRepName}
                  </Badge>
                )}
                {filters.customerName && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Cliente: {filters.customerName}
                  </Badge>
                )}
                {filters.orderStatus && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Status: {filters.orderStatus}
                  </Badge>
                )}
                {filters.minValue !== undefined && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Min: {formatCurrency(filters.minValue)}
                  </Badge>
                )}
                {filters.maxValue !== undefined && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Máx: {formatCurrency(filters.maxValue)}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
