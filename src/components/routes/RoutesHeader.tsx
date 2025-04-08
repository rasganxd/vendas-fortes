
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RoutesHeaderProps {
  onNewRoute: () => void;
}

export const RoutesHeader = ({ onNewRoute }: RoutesHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">Rotas de Entrega</h2>
        <p className="text-gray-500">Gerencie e planeje as rotas para entrega de pedidos</p>
      </div>
      <Button 
        className="bg-sales-800 hover:bg-sales-700"
        onClick={onNewRoute}
      >
        <Plus size={16} className="mr-2" /> Nova Rota
      </Button>
    </div>
  );
};
