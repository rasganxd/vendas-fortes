
import { useState } from 'react';
import { Order } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDateToBR } from '@/lib/date-utils';
import { Eye, FilePenLine, Trash, Archive } from 'lucide-react';

interface OrdersTableProps {
  filteredOrders: Order[];
  selectedOrderIds: string[];
  handleToggleOrderSelection: (orderId: string) => void;
  handleSelectAllOrders: () => void;
  handleViewOrder: (order: Order) => void;
  handleEditOrder: (order: Order) => void;
  handleDeleteOrder: (order: Order) => void;
  formatCurrency: (value: number | undefined) => string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  filteredOrders,
  selectedOrderIds,
  handleToggleOrderSelection,
  handleSelectAllOrders,
  handleViewOrder,
  handleEditOrder,
  handleDeleteOrder,
  formatCurrency,
}) => {
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendente</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500">Parcial</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] px-2">
              <Checkbox 
                checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length} 
                onCheckedChange={handleSelectAllOrders}
              />
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                Nenhum pedido encontrado
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id} className={order.archived ? "bg-gray-50" : ""}>
                <TableCell className="px-2">
                  <Checkbox 
                    checked={selectedOrderIds.includes(order.id)} 
                    onCheckedChange={() => handleToggleOrderSelection(order.id)}
                  />
                </TableCell>
                <TableCell>
                  {order.customerName}
                  {order.archived && (
                    <Badge variant="outline" className="ml-2">
                      <Archive size={12} className="mr-1" /> Arquivado
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{formatDateToBR(order.createdAt)}</TableCell>
                <TableCell>
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditOrder(order)}
                    >
                      <FilePenLine size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOrder(order)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
