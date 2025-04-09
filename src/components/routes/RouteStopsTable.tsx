
import { Button } from '@/components/ui/button';
import { RouteStop } from '@/types';
import { Trash2, Check, Clock, Edit } from 'lucide-react';

interface RouteStopsTableProps {
  stops: RouteStop[];
  isCompleted: boolean;
  onRemoveStop: (id: string) => void;
  onEditOrder?: (orderId: string) => void;
}

export function RouteStopsTable({ 
  stops, 
  isCompleted, 
  onRemoveStop,
  onEditOrder
}: RouteStopsTableProps) {
  const sortedStops = [...stops].sort((a, b) => {
    // Use either sequence or position, whichever is available
    const aPos = a.sequence !== undefined ? a.sequence : a.position;
    const bPos = b.sequence !== undefined ? b.sequence : b.position;
    return aPos - bPos;
  });
  
  return (
    <div className="border rounded-lg overflow-auto">
      <table className="w-full">
        <thead className="bg-gray-50 text-xs font-medium text-gray-500">
          <tr>
            <th className="py-3 px-4 text-left">#</th>
            <th className="py-3 px-4 text-left">Cliente</th>
            <th className="py-3 px-4 text-left">Endereço</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedStops.map((stop) => (
            <tr key={stop.id} className={stop.status === 'completed' || stop.completed ? 'bg-green-50' : undefined}>
              <td className="py-3 px-4">{stop.sequence !== undefined ? stop.sequence : stop.position}</td>
              <td className="py-3 px-4">{stop.customerName}</td>
              <td className="py-3 px-4 text-gray-600 text-sm">
                {stop.address}, {stop.city} - {stop.state}
              </td>
              <td className="py-3 px-4 text-center">
                {stop.status === 'completed' || stop.completed ? (
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                    <Check size={14} />
                    <span>Concluído</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 text-xs">
                    <Clock size={14} />
                    <span>Pendente</span>
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  {onEditOrder && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEditOrder(stop.orderId)}
                      className="h-7 px-2"
                    >
                      <Edit size={14} />
                      <span className="sr-only">Editar</span>
                    </Button>
                  )}
                  {!isCompleted && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onRemoveStop(stop.id)}
                      className="h-7 px-2"
                    >
                      <Trash2 size={14} />
                      <span className="sr-only">Remover</span>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {stops.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                Nenhuma parada adicionada à rota ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
