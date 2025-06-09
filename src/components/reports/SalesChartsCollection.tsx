
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ReportsData } from '@/types/reports';
import { formatCurrency } from '@/lib/format-utils';

interface SalesChartsCollectionProps {
  data: ReportsData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SalesChartsCollection: React.FC<SalesChartsCollectionProps> = ({ data }) => {
  console.log('📊 [SalesChartsCollection] Rendering charts with data:', data);

  // Preparar dados para gráfico de vendas por status
  const statusData = data.orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Preparar dados para gráfico de vendas por vendedor
  const salesRepData = data.salesRepPerformance?.slice(0, 5).map(rep => ({
    name: rep.name,
    receita: rep.totalRevenue,
    pedidos: rep.totalOrders
  })) || [];

  // Preparar dados temporais
  const timelineData = data.orders?.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>) || {};

  const timelineChartData = Object.entries(timelineData)
    .slice(-7) // Últimos 7 dias
    .map(([date, revenue]) => ({
      date,
      receita: revenue
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza - Status dos Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Top Vendedores */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesRepData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'receita' ? formatCurrency(value) : value,
                    name === 'receita' ? 'Receita' : 'Pedidos'
                  ]}
                />
                <Bar dataKey="receita" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Evolução Temporal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Evolução das Vendas (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesChartsCollection;
