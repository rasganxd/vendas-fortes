
import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyOrdersStateProps {
  handleNewOrder: () => void;
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ handleNewOrder }) => {
  return (
    <div className="p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-2 font-medium text-gray-900">Sem pedidos</h3>
      <p className="mt-1 text-gray-500">
        Nenhum pedido encontrado. Crie seu primeiro pedido para começar.
      </p>
      <div className="mt-6">
        <Button 
          onClick={handleNewOrder}
          className="bg-sales-800 hover:bg-sales-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Pedido
        </Button>
      </div>
    </div>
  );
};

export default EmptyOrdersState;
