
import React from 'react';
import MobileLayout from '@/mobile/layouts/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Route, TrendingUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function MobileDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const quickActions = [
    {
      title: 'Novo Pedido',
      description: 'Criar um novo pedido de venda',
      icon: ShoppingCart,
      action: () => navigate('/mobile/vendas/novo'),
      color: 'bg-green-500'
    },
    {
      title: 'Minhas Rotas',
      description: 'Ver rotas atribuídas para hoje',
      icon: Route,
      action: () => navigate('/mobile/rotas'),
      color: 'bg-blue-500'
    }
  ];

  const stats = [
    { title: 'Pedidos Hoje', value: '8', icon: ShoppingCart },
    { title: 'Rotas Pendentes', value: '3', icon: Route },
    { title: 'Meta do Mês', value: '75%', icon: TrendingUp },
    { title: 'Produtos', value: '156', icon: Package }
  ];

  return (
    <MobileLayout title="Dashboard">
      <div className="p-4 space-y-6">
        {/* Boas-vindas */}
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Bem-vindo, {userProfile?.name}!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <button
                    onClick={action.action}
                    className="w-full flex items-center space-x-4 text-left"
                  >
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Estatísticas */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Resumo do Dia</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <Icon size={24} className="mx-auto text-sales-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navegação Principal */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Funcionalidades</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => navigate('/mobile/vendas')}
              className="w-full p-6 bg-sales-800 hover:bg-sales-700 text-left justify-start"
            >
              <ShoppingCart className="mr-3" size={20} />
              <div>
                <div className="font-medium">Gerenciar Vendas</div>
                <div className="text-xs text-sales-200">Ver e criar pedidos</div>
              </div>
            </Button>
            
            <Button
              onClick={() => navigate('/mobile/rotas')}
              variant="outline"
              className="w-full p-6 text-left justify-start border-sales-200"
            >
              <Route className="mr-3" size={20} />
              <div>
                <div className="font-medium">Minhas Rotas</div>
                <div className="text-xs text-gray-500">Entregas e visitas</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
