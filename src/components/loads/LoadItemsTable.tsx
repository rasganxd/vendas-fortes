
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

interface LoadItemsTableProps {
  items: BuildLoadItem[];
  handleRemoveFromLoad: (orderId: string) => void;
}

const LoadItemsTable: React.FC<LoadItemsTableProps> = ({ 
  items,
  handleRemoveFromLoad
}) => {
  // Group items by orderId to avoid removing all items from the same order
  const orderGroups = items.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = [];
    }
    acc[item.orderId].push(item);
    return acc;
  }, {} as Record<string, BuildLoadItem[]>);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Quantidade</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(orderGroups).map(([orderId, orderItems]) => (
          <React.Fragment key={orderId}>
            {orderItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {index === 0 ? item.orderId.substring(0, 8) : ""}
                </TableCell>
                <TableCell>{item.productCode || "-"}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
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
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              Nenhum item adicionado à carga
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default LoadItemsTable;
