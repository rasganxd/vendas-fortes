
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SalesChartsCollection from '../SalesChartsCollection';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency, formatDate } from '@/lib/format-utils';

interface CompleteReportProps {
  data: ReportsData;
  filters: ReportFilters;
}

const CompleteReport: React.FC<CompleteReportProps> = ({ data, filters }) => {
  console.log('📊 [CompleteReport] Rendering with data:', data);

  return (
    <div className="space-y-6 p-6">
      {/* Gráficos */}
      <SalesChartsCollection data={data} />
      
      {/* Tabela de Vendas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders?.slice(0, 20).map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.code}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.salesRepName}</TableCell>
                  <TableCell>{order.items?.length || 0} itens</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise por Vendedor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.salesRepPerformance?.slice(0, 5).map((rep, index) => (
                <div key={rep.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{rep.name}</p>
                      <p className="text-sm text-muted-foreground">{rep.totalOrders} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(rep.totalRevenue)}</p>
                    <p className="text-sm text-muted-foreground">
                      Média: {formatCurrency(rep.averageTicket)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts?.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.totalQuantity} unidades vendidas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default CompleteReport;
