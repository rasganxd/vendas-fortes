
import React from 'react';
import { Order } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateToBR } from '@/lib/date-utils';

interface ImportHistoryTableProps {
  orders: Order[];
}

export default function ImportHistoryTable({ orders }: ImportHistoryTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'imported':
        return <Badge className="bg-green-500 hover:bg-green-600">Importado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Importação</TableHead>
            <TableHead>Importado Por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.code}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.salesRepName}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>{getStatusBadge(order.importStatus)}</TableCell>
                <TableCell>
                  {order.importedAt ? formatDateToBR(order.importedAt) : '-'}
                </TableCell>
                <TableCell>{order.importedBy || '-'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhum registro de importação encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
