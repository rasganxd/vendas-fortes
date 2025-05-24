import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface EmptyOrdersStateProps {
  handleNewOrder: () => void;
}
const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({
  handleNewOrder
}) => {
  return <div className="p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-2 font-medium text-gray-900">Sem pedidos</h3>
      
      <div className="mt-6">
        
      </div>
    </div>;
};
export default EmptyOrdersState;