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
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de linha - Vendas por período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{
              fontSize: 12
            }} tickFormatter={value => new Date(value).toLocaleDateString('pt-BR')} />
              <YAxis tick={{
              fontSize: 12
            }} tickFormatter={value => formatCurrency(value)} />
              <Tooltip labelFormatter={value => new Date(value).toLocaleDateString('pt-BR')} formatter={value => [formatCurrency(Number(value)), 'Receita']} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{
              fill: '#3B82F6',
              strokeWidth: 2,
              r: 4
            }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras - Performance por vendedor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesRepPerformance.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="salesRepName" tick={{
              fontSize: 12
            }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{
              fontSize: 12
            }} tickFormatter={value => formatCurrency(value)} />
              <Tooltip formatter={value => [formatCurrency(Number(value)), 'Receita']} />
              <Bar dataKey="totalRevenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de pizza - Top produtos */}
      

      {/* Gráfico de barras - Quantidade de pedidos por vendedor */}
      <Card>
        
        
      </Card>
    </div>;
};