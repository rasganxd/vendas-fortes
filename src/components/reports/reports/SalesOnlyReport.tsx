
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency, formatDate } from '@/lib/format-utils';

interface SalesOnlyReportProps {
  data: ReportsData;
  filters: ReportFilters;
}

const SalesOnlyReport: React.FC<SalesOnlyReportProps> = ({ data, filters }) => {
  console.log('📊 [SalesOnlyReport] Rendering with data:', data);

  const completedOrders = data.orders?.filter(order => order.status === 'completed') || [];
  const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Resumo de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {completedOrders.length}
              </p>
              <p className="text-sm text-muted-foreground">Vendas Concluídas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSales)}
              </p>
              <p className="text-sm text-muted-foreground">Receita de Vendas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(completedOrders.length > 0 ? totalSales / completedOrders.length : 0)}
              </p>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {completedOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Itens Vendidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data da Venda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.slice(0, 50).map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.code}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.salesRepName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.paymentMethod || 'Não informado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendas por Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              completedOrders.reduce((acc, order) => {
                const method = order.paymentMethod || 'Não informado';
                if (!acc[method]) {
                  acc[method] = { count: 0, total: 0 };
                }
                acc[method].count++;
                acc[method].total += order.total;
                return acc;
              }, {})
            ).map(([method, data]) => (
              <div key={method} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{method}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.count} vendas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(data.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((data.total / totalSales) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesOnlyReport;
