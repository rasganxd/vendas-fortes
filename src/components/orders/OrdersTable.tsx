
import React from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderTypeBadge } from './OrderTypeBadge';
import { RejectionReasonBadge } from './RejectionReasonBadge';
import { formatDateToBR } from '@/lib/date-utils';
import { MoreVertical, Eye, Edit, Trash2, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrdersTableProps {
  filteredOrders: Order[];
  selectedOrderIds: string[];
  handleToggleOrderSelection: (orderId: string) => void;
  handleSelectAllOrders: () => void;
  handleViewOrder: (order: Order) => void;
  handleEditOrder: (order: Order) => void;
  handleDeleteOrder: (order: Order) => void;
  formatCurrency: (value: number) => string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  filteredOrders,
  selectedOrderIds,
  handleToggleOrderSelection,
  handleSelectAllOrders,
  handleViewOrder,
  handleEditOrder,
  handleDeleteOrder,
  formatCurrency
}) => {
  const handleCopyOrderCode = (code: number) => {
    navigator.clipboard.writeText(code.toString());
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">
              <Checkbox
                checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                onCheckedChange={handleSelectAllOrders}
              />
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendedor
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredOrders.map((order) => {
            const isNegativeOrder = order.total === 0 && order.rejectionReason;
            
            return (
              <tr key={order.id} className={`hover:bg-gray-50 ${isNegativeOrder ? 'bg-orange-25' : ''}`}>
                <td className="p-3">
                  <Checkbox
                    checked={selectedOrderIds.includes(order.id)}
                    onCheckedChange={() => handleToggleOrderSelection(order.id)}
                  />
                </td>
                <td className="p-3">
                  <OrderTypeBadge order={order} showText={false} />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-medium">
                      {order.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyOrderCode(order.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm font-medium text-gray-900 max-w-48 truncate">
                    {order.customerName}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-gray-900 max-w-32 truncate">
                    {order.salesRepName}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-gray-900">
                    {formatDateToBR(order.date)}
                  </div>
                </td>
                <td className="p-3">
                  <div className={`text-sm font-medium ${isNegativeOrder ? 'text-gray-500' : 'text-green-600'}`}>
                    {isNegativeOrder ? '-' : formatCurrency(order.total)}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col space-y-1">
                    {isNegativeOrder ? (
                      <RejectionReasonBadge reason={order.rejectionReason} />
                    ) : (
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      {!isNegativeOrder && (
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteOrder(order)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
