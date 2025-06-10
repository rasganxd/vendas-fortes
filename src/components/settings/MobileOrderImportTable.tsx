
import React from 'react';
import { Order, MobileOrderGroup } from '@/types';
import { formatCurrency } from '@/lib/format-utils';
import { formatDateToBR } from '@/lib/date-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { OrderTypeBadge } from '@/components/orders/OrderTypeBadge';
import { RejectionReasonBadge } from '@/components/orders/RejectionReasonBadge';
import { ShoppingCart, MessageSquareX, User, Calendar, FileText } from 'lucide-react';

interface MobileOrderImportTableProps {
  groupedOrders: MobileOrderGroup[];
  selectedOrders: Set<string>;
  selectedSalesReps: Set<string>;
  onToggleOrder: (orderId: string) => void;
  onToggleSalesRep: (salesRepId: string) => void;
}

export const MobileOrderImportTable: React.FC<MobileOrderImportTableProps> = ({
  groupedOrders,
  selectedOrders,
  selectedSalesReps,
  onToggleOrder,
  onToggleSalesRep
}) => {
  const getTotalSalesValue = (orders: Order[]) => {
    return orders.filter(order => order.total > 0).reduce((sum, order) => sum + order.total, 0);
  };

  const getVisitsCount = (orders: Order[]) => {
    return orders.filter(order => order.total === 0 && order.rejectionReason).length;
  };

  const getSalesCount = (orders: Order[]) => {
    return orders.filter(order => order.total > 0).length;
  };

  return (
    <div className="space-y-4">
      {groupedOrders.map((group) => {
        const isGroupSelected = selectedSalesReps.has(group.salesRepId);
        const salesValue = getTotalSalesValue(group.orders);
        const visitsCount = getVisitsCount(group.orders);
        const salesCount = getSalesCount(group.orders);

        return (
          <Card key={group.salesRepId} className="overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isGroupSelected}
                    onCheckedChange={() => onToggleSalesRep(group.salesRepId)}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-lg">{group.salesRepName}</h3>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {salesCount} vendas
                      </span>
                      <span className="flex items-center">
                        <MessageSquareX className="w-3 h-3 mr-1" />
                        {visitsCount} visitas
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(salesValue)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {group.orders.length} pedidos
                </Badge>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Selecionar
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Código
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Cliente
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Valor
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">
                        Status/Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.orders.map((order, index) => {
                      const isSelected = selectedOrders.has(order.id);
                      const isNegativeOrder = order.total === 0 && order.rejectionReason;

                      return (
                        <tr 
                          key={order.id} 
                          className={`border-b hover:bg-gray-50 ${isNegativeOrder ? 'bg-orange-25' : ''} ${index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}`}
                        >
                          <td className="p-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => onToggleOrder(order.id)}
                            />
                          </td>
                          <td className="p-3">
                            <OrderTypeBadge order={order} showText={false} />
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-sm">
                              {order.code || order.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="max-w-48 truncate" title={order.customerName}>
                              {order.customerName}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDateToBR(order.date)}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`font-semibold ${isNegativeOrder ? 'text-gray-500' : 'text-green-600'}`}>
                              {isNegativeOrder ? '-' : formatCurrency(order.total)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col space-y-1">
                              {isNegativeOrder ? (
                                <RejectionReasonBadge reason={order.rejectionReason} />
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                                  {order.status}
                                </Badge>
                              )}
                              {order.visitNotes && (
                                <div className="flex items-center text-xs text-gray-500" title={order.visitNotes}>
                                  <FileText className="w-3 h-3 mr-1" />
                                  <span className="truncate max-w-24">{order.visitNotes}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileOrderImportTable;
