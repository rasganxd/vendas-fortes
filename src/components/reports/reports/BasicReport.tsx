
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesMetrics, SalesRepPerformance } from '@/types/reports';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface BasicReportProps {
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
}

export const BasicReport: React.FC<BasicReportProps> = ({ metrics, salesRepPerformance }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
          <p className="text-sm text-gray-600">
            Visão consolidada das vendas no período selecionado
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-sm text-gray-600">Receita Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{formatNumber(metrics.totalOrders)}</div>
              <div className="text-sm text-gray-600">Total de Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(metrics.averageOrderValue)}</div>
              <div className="text-sm text-gray-600">Ticket Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance dos Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesRepPerformance.slice(0, 5).map((rep, index) => (
              <div key={rep.salesRepId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{rep.salesRepName}</div>
                    <div className="text-sm text-gray-600">{formatNumber(rep.ordersCount)} pedidos</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(rep.totalRevenue)}</div>
                  <div className="text-sm text-gray-600">Ticket: {formatCurrency(rep.averageOrderValue)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
