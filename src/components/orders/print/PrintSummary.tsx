
import React from 'react';
import { Customer, Order } from '@/types';

interface PrintSummaryProps {
  printableOrders: Order[];
  selectedCustomerId: string;
  customers: Customer[];
}

const PrintSummary: React.FC<PrintSummaryProps> = ({
  printableOrders,
  selectedCustomerId,
  customers
}) => {
  return (
    <div className="bg-gray-50 rounded-md p-3">
      <p className="font-medium">Serão impressos:</p>
      <p className="text-sm text-gray-600">
        {printableOrders.length} pedido(s) 
        {selectedCustomerId !== 'all' && ` do cliente ${customers.find(c => c.id === selectedCustomerId)?.name || ""}`}
      </p>
    </div>
  );
};

export default PrintSummary;
