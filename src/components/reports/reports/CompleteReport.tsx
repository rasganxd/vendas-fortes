
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SalesReportData } from '@/types/reports';
import { formatCurrency, formatDateBR } from '@/lib/format-utils';

interface CompleteReportProps {
  data: SalesReportData[];
}

export const CompleteReport: React.FC<CompleteReportProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'confirmed': return 'Confirmado';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Completo de Vendas</CardTitle>
        <p className="text-sm text-gray-600">
          Detalhamento completo de todos os pedidos no período selecionado
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sale) => (
                <TableRow key={sale.orderId}>
                  <TableCell className="font-medium">#{sale.orderCode}</TableCell>
                  <TableCell>{formatDateBR(sale.date)}</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>{sale.salesRepName}</TableCell>
                  <TableCell className="text-center">{sale.itemsCount}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(sale.total)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sale.status)}>
                      {getStatusLabel(sale.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sale.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {sale.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.paymentMethod || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum dado encontrado para os filtros selecionados
          </div>
        )}
      </CardContent>
    </Card>
  );
};
