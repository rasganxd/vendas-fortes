
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency } from '@/lib/format-utils';

interface TimeAnalysisReportProps {
  data: ReportsData;
  filters: ReportFilters;
}

interface TimelineItem {
  date: string;
  revenue: number;
  orders: number;
  customers: Set<string>;
}

interface ProcessedTimelineItem {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageTicket: number;
}

const TimeAnalysisReport: React.FC<TimeAnalysisReportProps> = ({ data, filters }) => {
  console.log('📊 [TimeAnalysisReport] Rendering with data:', data);

  // Preparar dados temporais
  const timelineData = data.orders?.reduce((acc, order) => {
    const date = new Date(order.date).toISOString().split('T')[0];
    
    if (!acc[date]) {
      acc[date] = {
        date,
        revenue: 0,
        orders: 0,
        customers: new Set()
      };
    }
    
    acc[date].revenue += order.total;
    acc[date].orders += 1;
    acc[date].customers.add(order.customerId);
    
    return acc;
  }, {} as Record<string, TimelineItem>) || {};

  const chartData: ProcessedTimelineItem[] = Object.values(timelineData)
    .map(item => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders,
      customers: item.customers.size,
      averageTicket: item.orders > 0 ? item.revenue / item.orders : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Dados por dia da semana
  const weekdayData = data.orders?.reduce((acc, order) => {
    const weekday = new Date(order.date).toLocaleDateString('pt-BR', { weekday: 'long' });
    
    if (!acc[weekday]) {
      acc[weekday] = { day: weekday, revenue: 0, orders: 0 };
    }
    
    acc[weekday].revenue += order.total;
    acc[weekday].orders += 1;
    
    return acc;
  }, {} as Record<string, { day: string; revenue: number; orders: number }>) || {};

  const weekdayChartData = Object.values(weekdayData);

  // Dados por hora
  const hourlyData = data.orders?.reduce((acc, order) => {
    const hour = new Date(order.date).getHours();
    const hourKey = `${hour}:00`;
    
    if (!acc[hourKey]) {
      acc[hourKey] = { hour: hourKey, revenue: 0, orders: 0 };
    }
    
    acc[hourKey].revenue += order.total;
    acc[hourKey].orders += 1;
    
    return acc;
  }, {} as Record<string, { hour: string; revenue: number; orders: number }>) || {};

  const hourlyChartData = Object.values(hourlyData).sort((a, b) => 
    parseInt(a.hour.split(':')[0]) - parseInt(b.hour.split(':')[0])
  );

  return (
    <div className="space-y-6 p-6">
      {/* Tendência de Vendas ao Longo do Tempo */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Receita' : 
                    name === 'orders' ? 'Pedidos' : 'Clientes'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Período */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Receita' : 'Pedidos'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'orders' ? value : formatCurrency(value),
                      name === 'orders' ? 'Pedidos' : 'Receita'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Temporal Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' || name === 'averageTicket' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Receita' : 
                    name === 'orders' ? 'Pedidos' : 
                    name === 'customers' ? 'Clientes' : 'Ticket Médio'
                  ]}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="revenue"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="orders"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="customers"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="averageTicket" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="averageTicket"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Tendência */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {chartData.length > 0 ? 
                formatCurrency(chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length)
                : 'R$ 0,00'
              }
            </p>
            <p className="text-sm text-muted-foreground">Receita Média Diária</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {chartData.length > 0 ? 
                Math.round(chartData.reduce((sum, item) => sum + item.orders, 0) / chartData.length)
                : 0
              }
            </p>
            <p className="text-sm text-muted-foreground">Pedidos Médios/Dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {chartData.length > 0 ? 
                Math.round(chartData.reduce((sum, item) => sum + item.customers, 0) / chartData.length)
                : 0
              }
            </p>
            <p className="text-sm text-muted-foreground">Clientes Únicos/Dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {chartData.length > 1 ? 
                ((chartData[chartData.length - 1].revenue - chartData[0].revenue) / chartData[0].revenue * 100).toFixed(1)
                : 0
              }%
            </p>
            <p className="text-sm text-muted-foreground">Crescimento no Período</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeAnalysisReport;
