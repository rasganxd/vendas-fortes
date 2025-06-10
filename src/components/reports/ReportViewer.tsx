
import React from 'react';
import { ReportSummaryCards } from './ReportSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SalesReportData, SalesMetrics, SalesRepPerformance, TopProduct } from '@/types/reports';
import { formatCurrency, formatDateBR } from '@/lib/format-utils';

interface ReportViewerProps {
  salesReportData: SalesReportData[];
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
  appliedFilters?: string[];
  onPrintReport?: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  salesReportData,
  metrics,
  salesRepPerformance,
  topProducts,
  appliedFilters = [],
  onPrintReport
}) => {
  return (
    <div className="space-y-4 min-h-0">
      {/* Cards de resumo */}
      <ReportSummaryCards metrics={metrics} />
      
      {/* Dados de vendas simplificados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Nenhum dado encontrado para os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  salesReportData.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono text-sm">{order.orderCode}</TableCell>
                      <TableCell>{formatDateBR(order.date)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.salesRepName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'completed' ? 'Concluído' :
                           order.status === 'pending' ? 'Pendente' : 
                           order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
