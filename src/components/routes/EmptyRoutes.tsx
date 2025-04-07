
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';

interface EmptyRoutesProps {
  onCreateRoute: () => void;
}

export const EmptyRoutes = ({ onCreateRoute }: EmptyRoutesProps) => {
  return (
    <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
      <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma rota encontrada</h3>
      <p className="text-gray-500">Crie uma nova rota para começar a planejar suas entregas</p>
      <Button 
        className="mt-4 bg-sales-800 hover:bg-sales-700"
        onClick={onCreateRoute}
      >
        <Plus size={16} className="mr-2" /> Criar Nova Rota
      </Button>
    </div>
  );
};
