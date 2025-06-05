
import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';

interface LoadSummarySectionProps {
  selectedOrderIds: string[];
}

const LoadSummarySection: React.FC<LoadSummarySectionProps> = ({
  selectedOrderIds
}) => {
  const { orders } = useAppContext();

  const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));
  
  const totalValue = selectedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = selectedOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Carga</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedOrderIds.length}</div>
            <div className="text-sm text-gray-600">Pedidos</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Itens Total</div>
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-800">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-gray-600">Valor Total da Carga</div>
        </div>

        {selectedOrders.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Pedidos Selecionados:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedOrders.map(order => (
                <div key={order.id} className="text-xs bg-white p-2 rounded border">
                  <div className="font-medium">#{order.code} - {order.customerName}</div>
                  <div className="text-gray-500">{formatCurrency(order.total)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoadSummarySection;
