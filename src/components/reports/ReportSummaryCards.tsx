
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, DollarSign, Users, Package, Award } from 'lucide-react';
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
      title: 'Top Vendedor',
      value: metrics.topSalesRep || 'N/A',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Top Cliente',
      value: metrics.topCustomer || 'N/A',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1" title={card.value}>
                    {card.value.length > 15 ? `${card.value.substring(0, 15)}...` : card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                  <Icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
