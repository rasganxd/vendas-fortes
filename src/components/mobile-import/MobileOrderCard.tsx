
import React from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatDateToBR } from '@/lib/date-utils';

interface MobileOrderCardProps {
  order: Order;
  isSelected: boolean;
  onToggleSelection: (orderId: string) => void;
}

export default function MobileOrderCard({ 
  order, 
  isSelected, 
  onToggleSelection 
}: MobileOrderCardProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className={`cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(order.id)}
            />
            <div>
              <CardTitle className="text-sm font-medium">
                Pedido #{order.code}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDateToBR(order.createdAt)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Mobile
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(order.total)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Itens:</span>
            <span>{order.items?.length || 0}</span>
          </div>
          {order.mobileOrderId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Mobile:</span>
              <span className="text-xs font-mono">{order.mobileOrderId}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
