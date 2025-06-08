
import React from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Package } from 'lucide-react';
import MobileOrderCard from './MobileOrderCard';

interface SalesRepSectionProps {
  salesRepName: string;
  orders: Order[];
  selectedOrderIds: string[];
  onToggleOrderSelection: (orderId: string) => void;
  onSelectAllFromSalesRep: () => void;
}

export default function SalesRepSection({
  salesRepName,
  orders,
  selectedOrderIds,
  onToggleOrderSelection,
  onSelectAllFromSalesRep
}: SalesRepSectionProps) {
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
  const selectedCount = orders.filter(order => selectedOrderIds.includes(order.id)).length;
  const allSelected = orders.length > 0 && selectedCount === orders.length;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAllFromSalesRep}
            />
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{salesRepName}</CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4" />
              <span>{orders.length} pedidos</span>
            </div>
            <div className="font-medium text-green-600">
              {formatCurrency(totalValue)}
            </div>
            {selectedCount > 0 && (
              <div className="text-blue-600 font-medium">
                {selectedCount} selecionados
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Total de {totalItems} itens em {orders.length} pedidos
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <MobileOrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrderIds.includes(order.id)}
              onToggleSelection={onToggleOrderSelection}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
