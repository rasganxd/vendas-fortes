
import { DeliveryRoute } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Route, Truck, Edit, Trash2 } from 'lucide-react';
import { formatDateToBR } from '@/lib/date-utils';

interface RouteCardProps {
  route: DeliveryRoute;
  onViewRoute: (route: DeliveryRoute) => void;
  onEditRoute?: (route: DeliveryRoute) => void;
  onDeleteRoute?: (id: string) => void;
}

export const RouteCard = ({ route, onViewRoute, onEditRoute, onDeleteRoute }: RouteCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-500">Atribuída</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-500">Em Progresso</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-sales-800 text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold">{route.name}</h3>
        {getStatusBadge(route.status)}
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Data de Entrega</p>
              <p className="text-sm text-gray-600">{formatDateToBR(route.date)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Truck size={18} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Motorista / Veículo</p>
              <p className="text-sm text-gray-600">
                {route.driverName || 'Não atribuído'} / {route.vehicleName || 'Não atribuído'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Paradas</p>
              <p className="text-sm text-gray-600">{route.stops.length} paradas</p>
            </div>
          </div>
          
          <div className="pt-3 space-y-2">
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => onViewRoute(route)}
            >
              <Route size={16} className="mr-2" /> Ver Rota
            </Button>

            <div className="flex gap-2">
              {onEditRoute && (
                <Button 
                  variant="outline" 
                  className="w-1/2" 
                  onClick={() => onEditRoute(route)}
                >
                  <Edit size={16} className="mr-2" /> Editar
                </Button>
              )}
              {onDeleteRoute && (
                <Button 
                  variant="destructive" 
                  className="w-1/2" 
                  onClick={() => onDeleteRoute(route.id)}
                >
                  <Trash2 size={16} className="mr-2" /> Excluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
