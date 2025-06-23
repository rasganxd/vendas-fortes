
import React from 'react';
import { ReportSummaryCards } from './ReportSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SalesReportData, SalesMetrics, SalesRepPerformance, TopProduct } from '@/types/reports';
import { formatCurrency, formatDateBR } from '@/lib/format-utils';

interface ReportViewerProps {
  salesReportData: SalesReportData[];
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
  appliedFilters?: string[];
  onPrintReport?: () => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  salesReportData,
  metrics,
  salesRepPerformance,
  topProducts,
  appliedFilters = [],
  onPrintReport,
  sortBy = 'date',
  sortDirection = 'desc',
  onSort
}) => {

  const SortIcon = ({ field }: { field: string }) => {
    if (!onSort || sortBy !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className={onSort ? "cursor-pointer hover:bg-gray-50 select-none" : ""}
      onClick={() => onSort && onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Concluído', color: 'bg-green-100 text-green-700' },
      pending: { variant: 'secondary' as const, label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
      confirmed: { variant: 'outline' as const, label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
      processing: { variant: 'outline' as const, label: 'Processando', color: 'bg-purple-100 text-purple-700' },
      canceled: { variant: 'destructive' as const, label: 'Cancelado', color: 'bg-red-100 text-red-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline' as const,
      label: status,
      color: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 min-h-0">
      {/* Cards de resumo */}
      <ReportSummaryCards metrics={metrics} />
      
      {/* Dados de vendas com ordenação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Dados de Vendas
            <Badge variant="secondary" className="text-xs">
              {salesReportData.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table maxHeight="500px">
              <TableHeader>
                <TableRow>
                  <SortableHeader field="orderCode">Código</SortableHeader>
                  <SortableHeader field="date">Data</SortableHeader>
                  <SortableHeader field="customerName">Cliente</SortableHeader>
                  <SortableHeader field="salesRepName">Vendedor</SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                  <SortableHeader field="total">Valor</SortableHeader>
                  <TableHead className="text-center">Itens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Nenhum dado encontrado para os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  salesReportData.map((order) => (
                    <TableRow key={order.orderId} className="hover:bg-gray-50/50">
                      <TableCell className="font-mono text-sm">#{order.orderCode}</TableCell>
                      <TableCell className="text-sm">{formatDateBR(order.date)}</TableCell>
                      <TableCell className="font-medium max-w-48 truncate" title={order.customerName}>
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-sm max-w-32 truncate" title={order.salesRepName}>
                        {order.salesRepName}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {order.itemsCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top produtos se houver dados */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProducts.slice(0, 10).map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm truncate max-w-40" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.totalQuantity} unidades • {product.ordersCount} pedidos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatCurrency(product.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance por vendedor se houver dados */}
      {salesRepPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesRepPerformance.slice(0, 10).map((rep, index) => (
                <div 
                  key={rep.salesRepId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{rep.salesRepName}</div>
                      <div className="text-sm text-gray-500">
                        {rep.ordersCount} pedidos • {rep.productsCount} produtos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(rep.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Média: {formatCurrency(rep.averageOrderValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
