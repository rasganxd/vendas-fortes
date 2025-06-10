
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Users, Package, TrendingUp } from "lucide-react";
import { MobileOrderGroup } from '@/types';
import { OrderTypeBadge } from '@/components/orders/OrderTypeBadge';
import { RejectionReasonBadge } from '@/components/orders/RejectionReasonBadge';
import { formatDateToBR } from '@/lib/date-utils';

interface MobileOrderImportTableProps {
  groupedOrders: MobileOrderGroup[];
  selectedOrders: Set<string>;
  selectedSalesReps: Set<string>;
  isLoading: boolean;
  onToggleOrder: (orderId: string) => void;
  onToggleSalesRep: (salesRepId: string) => void;
}

export const MobileOrderImportTable: React.FC<MobileOrderImportTableProps> = ({
  groupedOrders,
  selectedOrders,
  selectedSalesReps,
  isLoading,
  onToggleOrder,
  onToggleSalesRep
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando pedidos pendentes...</div>
      </div>
    );
  }

  if (groupedOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pedido pendente
          </h3>
          <p className="text-gray-500">
            Não há pedidos mobile aguardando importação no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groupedOrders.map((group) => {
        const isSalesRepSelected = selectedSalesReps.has(group.salesRepId);
        const regularOrders = group.orders.filter(order => order.total > 0);
        const negativeOrders = group.orders.filter(order => order.total === 0 && order.rejectionReason);
        
        return (
          <Card key={group.salesRepId} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSalesRepSelected}
                    onCheckedChange={() => onToggleSalesRep(group.salesRepId)}
                  />
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">{group.salesRepName}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{group.count} pedidos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-600">
                      {formatCurrency(group.totalValue)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                {group.orders.map((order) => {
                  const isOrderSelected = selectedOrders.has(order.id);
                  const isNegativeOrder = order.total === 0 && order.rejectionReason;
                  
                  return (
                    <div
                      key={order.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isOrderSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      } ${isNegativeOrder ? 'bg-orange-25 border-orange-200' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isOrderSelected}
                          onCheckedChange={() => onToggleOrder(order.id)}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <OrderTypeBadge order={order} showText={false} />
                            <span className="font-medium">#{order.code}</span>
                            <span className="text-sm text-gray-600">{order.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatDateToBR(order.date)}
                            </span>
                            {isNegativeOrder && (
                              <RejectionReasonBadge reason={order.rejectionReason} />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${isNegativeOrder ? 'text-gray-500' : 'text-green-600'}`}>
                          {isNegativeOrder ? 'Visita' : formatCurrency(order.total)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items?.length || 0} itens
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileOrderImportTable;
