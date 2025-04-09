
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Quantidade</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.orderId.substring(0, 8)}</TableCell>
            <TableCell>{item.productName}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromLoad(item.orderId)}
                >
                  Remover
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              Nenhum item adicionado à carga
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default LoadItemsTable;
