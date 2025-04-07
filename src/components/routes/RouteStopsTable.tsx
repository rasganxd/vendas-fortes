
import { RouteStop } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface RouteStopsTableProps {
  stops: RouteStop[];
  isCompleted: boolean;
  onRemoveStop: (stopId: string) => void;
}

export const RouteStopsTable = ({ stops, isCompleted, onRemoveStop }: RouteStopsTableProps) => {
  const getStopStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="py-2 px-4 text-left">Seq.</th>
            <th className="py-2 px-4 text-left">Cliente</th>
            <th className="py-2 px-4 text-left">Endereço</th>
            <th className="py-2 px-4 text-left">Hora Prevista</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {stops.sort((a, b) => a.sequence - b.sequence).map((stop) => (
            <tr key={stop.id} className="border-b">
              <td className="py-2 px-4">{stop.sequence}</td>
              <td className="py-2 px-4 font-medium">{stop.customerName}</td>
              <td className="py-2 px-4">
                {stop.address}, {stop.city}/{stop.state}
              </td>
              <td className="py-2 px-4">
                {stop.estimatedArrival ? new Date(stop.estimatedArrival).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </td>
              <td className="py-2 px-4">{getStopStatusBadge(stop.status)}</td>
              <td className="py-2 px-4">
                {!isCompleted && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => onRemoveStop(stop.id)}
                  >
                    <X size={16} />
                  </Button>
                )}
              </td>
            </tr>
          ))}
          
          {stops.length === 0 && (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-500">
                Nenhuma parada adicionada a esta rota
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
