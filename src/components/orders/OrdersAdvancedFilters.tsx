
import React from 'react';
import { OrderAdvancedFilters, SalesRep, PaymentMethod, OrderStatus } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OrdersAdvancedFiltersProps {
  filters: OrderAdvancedFilters;
  onFilterChange: (filters: OrderAdvancedFilters) => void;
  onClearFilters: () => void;
  salesReps: SalesRep[];
  paymentMethods: PaymentMethod[];
}

const orderStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Processando' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'draft', label: 'Rascunho' },
];

const OrdersAdvancedFilters: React.FC<OrdersAdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  salesReps,
  paymentMethods,
}) => {
  const handleSelectChange = (field: keyof OrderAdvancedFilters) => (value: string) => {
    onFilterChange({ ...filters, [field]: value === 'all' ? undefined : value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div>
      <h4 className="font-semibold text-lg mb-4 px-4 pt-4">Filtros Avançados</h4>
      <div className="space-y-4 px-4 pb-4">
        <div>
          <Label htmlFor="salesRep">Vendedor</Label>
          <Select value={filters.salesRepId || 'all'} onValueChange={handleSelectChange('salesRepId')}>
            <SelectTrigger id="salesRep">
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {salesReps.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status do Pedido</Label>
          <Select value={filters.status || 'all'} onValueChange={handleSelectChange('status')}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {orderStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
          <Select value={filters.paymentMethodId || 'all'} onValueChange={handleSelectChange('paymentMethodId')}>
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Selecione uma forma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {paymentMethods.map(method => (
                <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minTotal">Valor Mínimo</Label>
            <Input
              id="minTotal"
              name="minTotal"
              type="number"
              placeholder="R$ 0,00"
              value={filters.minTotal || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="maxTotal">Valor Máximo</Label>
            <Input
              id="maxTotal"
              name="maxTotal"
              type="number"
              placeholder="R$ 1.000,00"
              value={filters.maxTotal || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end rounded-b-md">
        <Button variant="ghost" onClick={onClearFilters}>Limpar Filtros</Button>
      </div>
    </div>
  );
};

export default OrdersAdvancedFilters;
