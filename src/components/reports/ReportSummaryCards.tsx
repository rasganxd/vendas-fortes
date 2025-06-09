
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SummaryData } from '@/types/reports';

interface ReportSummaryCardsProps {
  summaryData: SummaryData | null;
  isLoading: boolean;
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  summaryData,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryData) {
    return null;
  }

  const cards = [
    {
      title: 'Receita Total',
      value: `R$ ${summaryData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: summaryData.revenueChange,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Total de Pedidos',
      value: summaryData.totalOrders.toString(),
      change: summaryData.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Clientes Ativos',
      value: summaryData.activeCustomers.toString(),
      change: summaryData.customersChange,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${summaryData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: summaryData.ticketChange,
      icon: Target,
      color: 'text-orange-600'
    }
  ];

  console.log('📊 [ReportSummaryCards] Rendering summary data:', summaryData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(card.change).toFixed(1)}%
                </span>
                <span className="ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReportSummaryCards;
