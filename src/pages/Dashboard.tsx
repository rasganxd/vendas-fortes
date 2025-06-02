
import React from 'react';
import { useAppData } from '@/context/providers/AppDataProvider';
import PageLayout from '@/components/layout/PageLayout';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  CreditCard,
  Calendar,
  MapPin,
  Truck,
  Receipt
} from 'lucide-react';

export default function Dashboard() {
  const {
    customers = [],
    salesReps = [],
    orders = [],
    paymentMethods = [],
    paymentTables = [],
    isLoadingCustomers,
    isLoadingSalesReps,
    isLoadingOrders,
    isLoadingPaymentMethods,
    isLoadingPaymentTables
  } = useAppData();

  // Calculate metrics with safe defaults
  const totalOrders = orders?.length || 0;
  const totalCustomers = customers?.length || 0;
  const totalSalesReps = salesReps?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  
  // Recent orders (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = orders?.filter(order => new Date(order.date) >= thirtyDaysAgo) || [];
  
  // Pending orders
  const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
  
  // Active customers
  const activeCustomers = customers?.filter(customer => customer.active) || [];

  const stats = [
    {
      title: 'Total de Pedidos',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      description: `${recentOrders.length} nos últimos 30 dias`,
      color: 'bg-blue-500'
    },
    {
      title: 'Clientes Ativos',
      value: activeCustomers.length.toString(),
      icon: Users,
      description: `${totalCustomers} total`,
      color: 'bg-green-500'
    },
    {
      title: 'Receita Total',
      value: totalRevenue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      icon: TrendingUp,
      description: 'Todos os pedidos',
      color: 'bg-purple-500'
    },
    {
      title: 'Pedidos Pendentes',
      value: pendingOrders.length.toString(),
      icon: Calendar,
      description: 'Aguardando confirmação',
      color: 'bg-yellow-500'
    }
  ];

  const quickActions = [
    {
      title: 'Novo Pedido',
      description: 'Criar um novo pedido',
      icon: ShoppingCart,
      href: '/pedidos',
      color: 'bg-blue-500'
    },
    {
      title: 'Gerenciar Clientes',
      description: 'Adicionar ou editar clientes',
      icon: Users,
      href: '/clientes',
      color: 'bg-green-500'
    },
    {
      title: 'Rotas de Entrega',
      description: 'Organizar entregas',
      icon: MapPin,
      href: '/rotas-entrega',
      color: 'bg-purple-500'
    },
    {
      title: 'Gerenciar Veículos',
      description: 'Controlar frota',
      icon: Truck,
      href: '/veiculos',
      color: 'bg-orange-500'
    },
    {
      title: 'Métodos de Pagamento',
      description: 'Configurar pagamentos',
      icon: CreditCard,
      href: '/metodos-pagamento',
      color: 'bg-indigo-500'
    },
    {
      title: 'Relatórios',
      description: 'Visualizar estatísticas',
      icon: Receipt,
      href: '/relatorios',
      color: 'bg-pink-500'
    }
  ];

  const isLoading = isLoadingCustomers || isLoadingSalesReps || isLoadingOrders || 
                    isLoadingPaymentMethods || isLoadingPaymentTables;

  if (isLoading) {
    return (
      <PageLayout title="Dashboard" subtitle="Visão geral do sistema">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Dashboard" 
      subtitle="Visão geral do sistema"
      description="Acompanhe as principais métricas e acesse rapidamente as funcionalidades"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <EnhancedCard key={index} variant="glass">
              <EnhancedCardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          ))}
        </div>

        {/* Quick Actions */}
        <EnhancedCard variant="default">
          <EnhancedCardHeader>
            <EnhancedCardTitle>Ações Rápidas</EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                      <action.icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedCard variant="default">
            <EnhancedCardHeader>
              <EnhancedCardTitle>Pedidos Recentes</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <RecentOrdersTable orders={recentOrders.slice(0, 5)} />
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="default">
            <EnhancedCardHeader>
              <EnhancedCardTitle>Resumo do Sistema</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vendedores Ativos</span>
                  <span className="font-medium">{salesReps?.filter(rep => rep.active).length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Métodos de Pagamento</span>
                  <span className="font-medium">{paymentMethods?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tabelas de Pagamento</span>
                  <span className="font-medium">{paymentTables?.filter(table => table.active).length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pedidos Confirmados</span>
                  <span className="font-medium">{orders?.filter(order => order.status === 'confirmed').length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pedidos Entregues</span>
                  <span className="font-medium">{orders?.filter(order => order.status === 'delivered').length || 0}</span>
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </PageLayout>
  );
}
