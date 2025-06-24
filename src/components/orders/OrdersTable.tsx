import React from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDateToBR } from '@/lib/date-utils';
import { Eye, Edit, Trash2, Copy } from 'lucide-react';
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
  const handleCopyCustomerCode = (customerCode: number | undefined) => {
    if (customerCode) {
      navigator.clipboard.writeText(customerCode.toString());
    }
  };
  return <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">
              <Checkbox checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0} onCheckedChange={handleSelectAllOrders} />
            </th>
            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código Cliente
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
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredOrders.map(order => {
          const isNegativeOrder = order.total === 0 && order.rejectionReason;
          return <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox checked={selectedOrderIds.includes(order.id)} onCheckedChange={() => handleToggleOrderSelection(order.id)} />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-medium">
                      {order.customerCode || '-'}
                    </span>
                    {order.customerCode}
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
                    {isNegativeOrder ? 'Visita' : formatCurrency(order.total)}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewOrder(order)} title="Ver detalhes">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!isNegativeOrder && <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditOrder(order)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteOrder(order)} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>;
        })}
        </tbody>
      </table>
    </div>;
};
export default OrdersTable;