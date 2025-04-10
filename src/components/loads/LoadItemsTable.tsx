
import React from 'react';
import { BuildLoadItem } from '@/pages/BuildLoad';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/useAppContext';

interface LoadItemsTableProps {
  items: BuildLoadItem[];
  handleRemoveFromLoad: (orderId: string) => void;
}

const LoadItemsTable: React.FC<LoadItemsTableProps> = ({ 
  items,
  handleRemoveFromLoad
}) => {
  const { orders, customers } = useAppContext();

  // Group items by orderId to avoid removing all items from the same order
  const orderGroups = items.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = [];
    }
    acc[item.orderId].push(item);
    return acc;
  }, {} as Record<string, BuildLoadItem[]>);

  // Get customer code and order total for each order
  const getOrderInfo = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { customerCode: "-", orderTotal: 0 };
    
    const customer = customers.find(c => c.id === order.customerId);
    const customerCode = customer?.code || "-";
    const orderTotal = order.total;
    
    return { customerCode, orderTotal };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código Cliente</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Quantidade</TableHead>
          <TableHead>Total Pedido</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(orderGroups).map(([orderId, orderItems]) => {
          const { customerCode, orderTotal } = getOrderInfo(orderId);
          
          return (
            <React.Fragment key={orderId}>
              {orderItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {index === 0 ? customerCode : ""}
                  </TableCell>
                  <TableCell>{item.productCode || "-"}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {index === 0 ? `R$ ${orderTotal.toFixed(2)}` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {index === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromLoad(item.orderId)}
                        className="hover:text-red-500"
                      >
                        Remover
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          );
        })}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              Nenhum item adicionado à carga
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default LoadItemsTable;
