
import React from 'react';
import MobileLayout from '@/mobile/layouts/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, DollarSign, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { formatDateToBR } from '@/lib/date-utils';

export default function MobileSales() {
  const navigate = useNavigate();
  const { orders } = useAppContext();
  
  // Filtrar pedidos do vendedor (simulado)
  const myOrders = orders.slice(0, 10);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'Rascunho';
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <MobileLayout title="Vendas">
      <div className="p-4 space-y-4">
        {/* Header com botão de novo pedido */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meus Pedidos</h2>
            <p className="text-sm text-gray-600">{myOrders.length} pedidos</p>
          </div>
          <Button 
            onClick={() => navigate('/mobile/vendas/novo')}
            className="bg-sales-800 hover:bg-sales-700"
          >
            <Plus size={16} className="mr-1" />
            Novo
          </Button>
        </div>

        {/* Resumo rápido */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {myOrders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Concluídos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {myOrders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-gray-600">
                {formatCurrency(myOrders.reduce((sum, order) => sum + order.total, 0))}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-3">
          {myOrders.length > 0 ? (
            myOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Pedido #{order.code}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} font-normal text-xs`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {formatDateToBR(order.date)}
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign size={16} className="mr-1" />
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-2" />
                      {order.salesRepName}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/mobile/vendas/${order.id}`)}
                    >
                      <Eye size={16} className="mr-1" />
                      Ver Detalhes
                    </Button>
                    
                    {order.status === 'draft' && (
                      <Button 
                        size="sm"
                        className="flex-1 bg-sales-800 hover:bg-sales-700"
                        onClick={() => navigate(`/mobile/vendas/${order.id}/editar`)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comece criando seu primeiro pedido.
                </p>
                <Button 
                  onClick={() => navigate('/mobile/vendas/novo')}
                  className="bg-sales-800 hover:bg-sales-700"
                >
                  <Plus size={16} className="mr-2" />
                  Criar Pedido
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
