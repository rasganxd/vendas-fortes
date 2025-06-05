
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmptyLoads = () => {
  const navigate = useNavigate();
  
  return (
    <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
      <Package size={48} className="mx-auto text-gray-400 mb-2" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma carga encontrada</h3>
      <p className="text-gray-500">Crie uma nova carga para começar</p>
      <Button 
        className="mt-4 bg-sales-800 hover:bg-sales-700"
        onClick={() => navigate('/carregamentos/montar')}
      >
        <Plus size={16} className="mr-2" /> Montar Carga
      </Button>
    </div>
  );
};
