
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  filteredOrders = [],  // Provide default empty array
  selectedOrderIds = [],  // Provide default empty array
  handleToggleOrderSelection = () => {},  // Default no-op function
  handleSelectAllOrders = () => {},  // Default no-op function
  handleViewOrder = () => {},  // Default no-op function
  handleEditOrder = () => {},  // Default no-op function
  handleDeleteOrder = () => {},  // Default no-op function
  formatCurrency = (value) => `R$ ${value?.toFixed(2) || '0.00'}`,  // Default formatter
}) => {
  const navigate = useNavigate();
  
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
  
  // Optimized edit handler
  const handleEdit = (order: Order, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleEditOrder(order);
  };

  // Guard against undefined array
  if (!filteredOrders || !Array.isArray(filteredOrders)) {
    return (
      <div className="relative border rounded-md">
        <TableRow>
          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
            Nenhum pedido encontrado
          </TableCell>
        </TableRow>
      </div>
    );
  }

  return (
    <div className="relative border rounded-md">
      <ScrollArea className="h-[calc(100vh-250px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
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
                        onClick={(e) => handleEdit(order, e)}
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
      </ScrollArea>
    </div>
  );
};

export default OrdersTable;
