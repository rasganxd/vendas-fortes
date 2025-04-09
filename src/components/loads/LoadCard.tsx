
import React from 'react';
import { formatDateToBR } from '@/lib/date-utils';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  MoreVertical, 
  Printer,
  Calendar,
  Truck,
  Package,
  Lock,
  Unlock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Load } from '@/types';
import { useLoads } from '@/hooks/useLoads';

interface LoadCardProps {
  load: Load;
  onView: (load: Load) => void;
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
  onPrint: () => void;
}

export const LoadCard: React.FC<LoadCardProps> = ({ 
  load, 
  onView, 
  onEdit, 
  onDelete,
  onPrint
}) => {
  const { toggleLoadLock } = useLoads();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'loading':
        return <Badge className="bg-blue-500">Carregando</Badge>;
      case 'loaded':
        return <Badge className="bg-amber-500">Carregado</Badge>;
      case 'in-transit':
        return <Badge className="bg-purple-500">Em Trânsito</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleLockToggle = async () => {
    await toggleLoadLock(load.id, !load.locked);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{load.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(load)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Visualizar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(load)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLockToggle}>
                {load.locked ? (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    <span>Desbloquear Carga</span>
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Bloquear Carga</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPrint}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Romaneio</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(load.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {getStatusBadge(load.status || 'planning')}
          {load.locked && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
              <Lock className="h-3 w-3 mr-1" /> Bloqueada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar size={14} />
            <span className="text-sm">{formatDateToBR(load.date)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Truck size={14} />
            <span className="text-sm">{load.vehicleName || 'Veículo não definido'}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Package size={14} />
            <span className="text-sm">
              {load.orderIds ? `${load.orderIds.length} pedidos` : 'Sem pedidos'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView(load)}
          >
            <Eye className="h-4 w-4 mr-1" /> Detalhes
          </Button>
          <Button 
            className="flex-1 bg-sales-800 hover:bg-sales-700" 
            size="sm"
            onClick={() => onEdit(load)}
          >
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
