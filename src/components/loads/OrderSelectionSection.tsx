
import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import BuildLoadOrdersTable from './BuildLoadOrdersTable';
import { Order } from '@/types';

interface OrderSelectionSectionProps {
  selectedOrderIds: string[];
  onOrderSelect: (order: Order, isChecked: boolean) => void;
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
}

const OrderSelectionSection: React.FC<OrderSelectionSectionProps> = ({
  selectedOrderIds,
  onOrderSelect,
  selectAll,
  onSelectAll
}) => {
  const { orders } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter available orders (pending/confirmed and not already in active loads)
  const availableOrders = useMemo(() => {
    return orders.filter(order => 
      (order.status === 'pending' || order.status === 'confirmed') &&
      !order.archived &&
      (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.code.toString().includes(searchTerm))
    );
  }, [orders, searchTerm]);

  // For now, no blocked orders logic - can be added later when load management is enhanced
  const blockedOrders: Order[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Pedidos para a Carga</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <div className="relative flex-1">
            <Label htmlFor="order-search">Buscar pedidos</Label>
            <Input
              id="order-search"
              type="text"
              placeholder="Buscar por cliente, código do pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <BuildLoadOrdersTable
            filteredOrders={availableOrders}
            selectedOrderIds={selectedOrderIds}
            handleOrderSelect={onOrderSelect}
            selectAll={selectAll}
            handleSelectAll={onSelectAll}
            blockedOrders={blockedOrders}
          />
        </div>

        <div className="text-sm text-gray-600">
          {selectedOrderIds.length} pedido(s) selecionado(s) de {availableOrders.length} disponível(is)
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSelectionSection;
