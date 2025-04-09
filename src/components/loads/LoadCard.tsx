
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Printer } from 'lucide-react';
import { Load } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';

interface LoadCardProps {
  load: Load;
  onView: (load: Load) => void;
  onEdit: (load: Load) => void;
  onDelete: (id: string) => void;
  onPrint?: (load: Load) => void;
}

export const LoadCard = ({ load, onView, onEdit, onDelete, onPrint }: LoadCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getStatusBadge = (status: string | undefined) => {
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
        return <Badge>{status || 'Sem Status'}</Badge>;
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleting(true);
    setTimeout(() => setIsDeleting(false), 2000);
    onDelete(load.id);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{load.name}</CardTitle>
          {getStatusBadge(load.status)}
        </div>
        <div className="text-xs text-gray-500">{formatDateToBR(load.date)}</div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Pedidos:</span>
            <span className="font-medium">{load.items?.length || 0}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Veículo:</span>
            <span className="font-medium">{load.vehicleName || 'Não atribuído'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-2 grid grid-cols-4 gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => onView(load)} className="flex-1">
          <Eye size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(load)} className="flex-1">
          <Edit size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive flex-1"
          disabled={isDeleting}
          onClick={handleDeleteClick}
        >
          <Trash2 size={16} />
        </Button>
        {onPrint && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPrint(load)} 
            className="flex-1"
            title="Imprimir romaneio de separação"
          >
            <Printer size={16} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
