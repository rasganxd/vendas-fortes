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
      

      {/* Gráfico de barras - Performance por vendedor */}
      <Card>
        
        
      </Card>

      {/* Gráfico de pizza - Top produtos */}
      

      {/* Gráfico de barras - Quantidade de pedidos por vendedor */}
      <Card>
        
        
      </Card>
    </div>;
};