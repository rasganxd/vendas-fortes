
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartData, SalesRepPerformance, TopProduct } from '@/types/reports';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface SalesChartsCollectionProps {
  chartData: ChartData[];
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
}

export const SalesChartsCollection: React.FC<SalesChartsCollectionProps> = ({
  chartData,
  salesRepPerformance,
  topProducts
}) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'Receita' || name === 'value') {
      return formatCurrency(value);
    }
    return formatNumber(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      {/* Gráfico de linha - Vendas por período */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), 'Receita']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 11 }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras - Performance por vendedor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Performance por Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesRepPerformance.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="salesRepName" 
                fontSize={12}
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), 'Receita Total']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar 
                dataKey="totalRevenue" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de pizza - Top produtos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Produtos</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topProducts.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalRevenue"
              >
                {topProducts.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), 'Receita']}
                contentStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras - Quantidade de pedidos por vendedor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pedidos por Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesRepPerformance.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="salesRepName" 
                fontSize={12}
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value, name) => [formatNumber(Number(value)), 'Qtd Pedidos']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar 
                dataKey="ordersCount" 
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
