
import { useState } from 'react';
import { Calendar, Package, Truck, ListChecks, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Load } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LoadCardProps {
  load: Load;
  onView: (load: Load) => void;
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
}

export const LoadCard = ({ load, onView, onEdit, onDelete }: LoadCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const getLoadProgress = (status: string) => {
    switch (status) {
      case 'planning': return 20;
      case 'loading': return 40;
      case 'loaded': return 60;
      case 'in-transit': return 80;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete(load.id);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-sales-800 text-white p-3 flex justify-between items-center">
              <h3 className="font-semibold">{load.name}</h3>
              {getStatusBadge(load.status)}
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Data</p>
                    <p className="text-sm text-gray-600">{formatDateToBR(load.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Veículo</p>
                    <p className="text-sm text-gray-600">{load.vehicleName || 'Não atribuído'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Package size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Itens</p>
                    <p className="text-sm text-gray-600">{load.items.length} itens</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>Progresso</span>
                    <span>{getLoadProgress(load.status)}%</span>
                  </div>
                  <Progress value={getLoadProgress(load.status)} className="h-2" />
                </div>
                
                <div className="pt-3">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => onView(load)}
                  >
                    <ListChecks size={16} className="mr-2" /> Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => onEdit(load)} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)} 
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a carga "{load.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
