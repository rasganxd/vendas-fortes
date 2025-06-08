
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  History as HistoryIcon
} from "lucide-react";
import { Order } from '@/types';

interface ImportHistoryTableProps {
  importHistory: Order[];
  isLoading: boolean;
}

export function ImportHistoryTable({
  importHistory,
  isLoading
}: ImportHistoryTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Carregando histórico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (importHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Nenhum histórico</h3>
            <p>Ainda não foram realizadas importações ou rejeições.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Data Pedido</TableHead>
              <TableHead>Data Importação</TableHead>
              <TableHead>Processado por</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importHistory.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Badge 
                    variant={order.importStatus === 'imported' ? 'default' : 'destructive'}
                    className={order.importStatus === 'imported' ? 'bg-green-500' : ''}
                  >
                    {order.importStatus === 'imported' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Importado
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejeitado
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">#{order.code}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" />
                    {order.salesRepName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {order.date.toLocaleDateString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell>
                  {order.importedAt ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {order.importedAt.toLocaleDateString('pt-BR')} às{' '}
                      {order.importedAt.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{order.importedBy || 'admin'}</TableCell>
                <TableCell className="text-right font-medium">
                  R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
