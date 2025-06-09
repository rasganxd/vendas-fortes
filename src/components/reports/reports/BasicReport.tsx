
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency } from '@/lib/format-utils';

interface BasicReportProps {
  data: ReportsData;
  filters: ReportFilters;
}

const BasicReport: React.FC<BasicReportProps> = ({ data, filters }) => {
  console.log('📊 [BasicReport] Rendering with data:', data);

  const totalRevenue = data.orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = data.orders?.length || 0;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusSummary = data.orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6 p-6">
      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {totalOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(averageTicket)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(statusSummary).map(([status, count]) => {
            const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            
            return (
              <div key={status} className="space-y-2">
                <div className="flex justify-between">
                  <span className="capitalize">{status}</span>
                  <span>{count} ({percentage.toFixed(1)}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Resumo por Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.salesRepPerformance?.slice(0, 10).map(rep => (
              <div key={rep.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{rep.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {rep.totalOrders} pedidos
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(rep.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(rep.averageTicket)} média
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

export default BasicReport;
