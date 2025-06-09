
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SalesReportData } from '@/types/reports';
import { formatCurrency, formatDateBR } from '@/lib/format-utils';

interface SalesOnlyReportProps {
  data: SalesReportData[];
}

export const SalesOnlyReport: React.FC<SalesOnlyReportProps> = ({ data }) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.total, 0);
  const averageOrderValue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Vendas</CardTitle>
        <p className="text-sm text-gray-600">
          Foco nas transações de vendas - {data.length} vendas totalizando {formatCurrency(totalRevenue)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-gray-600">Total de Vendas</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sale) => {
                const percentage = totalRevenue > 0 ? (sale.total / totalRevenue) * 100 : 0;
                return (
                  <TableRow key={sale.orderId}>
                    <TableCell className="font-medium">#{sale.orderCode}</TableCell>
                    <TableCell>{formatDateBR(sale.date)}</TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.salesRepName}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma venda encontrada para os filtros selecionados
          </div>
        )}
      </CardContent>
    </Card>
  );
};
