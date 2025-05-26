
import React from 'react';
import MobileLayout from '@/mobile/layouts/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export default function MobileRoutes() {
  const { routes } = useAppContext();
  
  // Filtrar rotas do vendedor logado (simulado)
  const myRoutes = routes.filter(route => 
    route.status === 'assigned' || route.status === 'in-progress'
  ).slice(0, 3);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'assigned': return 'Atribuída';
      case 'in-progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  return (
    <MobileLayout title="Minhas Rotas">
      <div className="p-4 space-y-4">
        {/* Header com resumo */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Rotas de Hoje</h3>
                <p className="text-sm text-gray-600">{myRoutes.length} rotas atribuídas</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sales-800">
                  {myRoutes.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-600">Concluídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Rotas */}
        <div className="space-y-3">
          {myRoutes.length > 0 ? (
            myRoutes.map((route) => (
              <Card key={route.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{route.name}</CardTitle>
                    <Badge className={`${getStatusColor(route.status)} font-normal text-xs`}>
                      {getStatusLabel(route.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span>{route.stops?.length || 0} paradas</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span>
                        {new Date(route.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {route.vehicleName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Navigation size={16} className="mr-2" />
                        <span>{route.vehicleName}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-sales-800 hover:bg-sales-700"
                    >
                      <MapPin size={16} className="mr-1" />
                      Ver Mapa
                    </Button>
                    
                    {route.status === 'assigned' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        Iniciar Rota
                      </Button>
                    )}
                    
                    {route.status === 'in-progress' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Finalizar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma rota atribuída
                </h3>
                <p className="text-sm text-gray-600">
                  Não há rotas atribuídas para você hoje.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://maps.google.com', '_blank')}
          >
            <Navigation size={16} className="mr-2" />
            Abrir GPS
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
