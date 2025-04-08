
import { Load } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { 
  Calendar, 
  PackageOpen, 
  Truck, 
  FileBarChart,
  Edit,
  Trash2
} from 'lucide-react';

interface LoadCardProps {
  load: Load;
  onView: (load: Load) => void;
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
}

export const LoadCard = ({ load, onView, onEdit, onDelete }: LoadCardProps) => {
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
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
              <p className="text-sm text-gray-600">
                {load.vehicleName || 'Não atribuído'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <PackageOpen size={18} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Itens</p>
              <p className="text-sm text-gray-600">{load.items.length} itens</p>
            </div>
          </div>
          
          <div className="pt-3 space-y-2">
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => onView(load)}
            >
              <FileBarChart size={16} className="mr-2" /> Detalhes
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-1/2" 
                onClick={() => onEdit(load)}
              >
                <Edit size={16} className="mr-2" /> Editar
              </Button>
              <Button 
                variant="destructive" 
                className="w-1/2" 
                onClick={() => onDelete(load.id)}
              >
                <Trash2 size={16} className="mr-2" /> Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
