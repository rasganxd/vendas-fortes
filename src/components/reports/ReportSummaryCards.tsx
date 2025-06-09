
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { SalesMetrics } from '@/types/reports';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface ReportSummaryCardsProps {
  metrics: SalesMetrics;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Receita Total',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total de Pedidos',
      value: formatNumber(metrics.totalOrders),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(metrics.averageOrderValue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Produtos Vendidos',
      value: formatNumber(metrics.totalProducts),
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 truncate">{card.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5 truncate" title={card.value}>
                    {card.value.length > 12 ? `${card.value.substring(0, 12)}...` : card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} ${card.color} p-1.5 rounded-lg flex-shrink-0`}>
                  <Icon size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
