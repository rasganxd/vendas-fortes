
import React, { useState, useEffect } from 'react';
import { Customer, Order, PaymentTable } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/useAppContext';
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';

interface PromissoryNotesTabProps {
  pendingPaymentOrders: Array<{
    id: string;
    customerName: string;
    customerId: string;
    total: number;
    paymentTableId: string | undefined;
    paid: number;
    paymentMethod?: string;
  }>;
  paymentTables: PaymentTable[];
  customers: Customer[];
  orders: Order[];
}

const PromissoryNotesTab: React.FC<PromissoryNotesTabProps> = ({
  pendingPaymentOrders,
  paymentTables,
  customers,
  orders
}) => {
  const { paymentTables: allPaymentTables } = useAppContext();
  const [showPromissoryNote, setShowPromissoryNote] = useState(false);
  const [selectedPaymentTable, setSelectedPaymentTable] = useState<PaymentTable | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [search, setSearch] = useState('');
  
  const handleViewPromissoryNote = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.paymentTableId) {
      const paymentTable = allPaymentTables.find(pt => pt.id === order.paymentTableId);
      if (paymentTable && paymentTable.type === 'promissory_note') {
        setSelectedPaymentTable(paymentTable);
        setSelectedOrderId(orderId);
        setShowPromissoryNote(true);
      }
    }
  };
  
  const getOrderCustomer = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  // Filter orders that use promissory notes
  const filteredOrders = orders.filter(order => {
    // Filter by search term, payment method, and payment table type
    const matchesSearch = search === '' || 
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    
    // Check if this is a promissory note order
    const isPromissoryNote = order.paymentMethod === 'promissoria';
    
    // Check if payment table is a promissory note type
    const paymentTable = order.paymentTableId ? 
      allPaymentTables.find(pt => pt.id === order.paymentTableId) : null;
    
    const isPromissoryNoteTable = paymentTable?.type === 'promissory_note';
    
    return matchesSearch && isPromissoryNote && isPromissoryNoteTable;
  });

  useEffect(() => {
    console.log("All orders:", orders);
    console.log("Promissory note orders:", filteredOrders);
  }, [orders, filteredOrders]);

  return (
    <>
      {showPromissoryNote && selectedPaymentTable && selectedOrderId ? (
        <div className="mt-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPromissoryNote(false)}
              className="mb-4"
            >
              Voltar para lista
            </Button>
          </div>
          
          {(() => {
            const order = orders.find(o => o.id === selectedOrderId);
            if (!order) return <div>Pedido não encontrado</div>;
            
            const customer = getOrderCustomer(order.customerId);
            if (!customer) return <div>Cliente não encontrado</div>;
            
            return (
              <PromissoryNoteView
                customerId={customer.id}
                customerName={customer.name}
                paymentTable={selectedPaymentTable}
                total={order.total}
              />
            );
          })()}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar por cliente ou pedido..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => {
                const paymentTable = order.paymentTableId ? 
                  allPaymentTables.find(pt => pt.id === order.paymentTableId) : null;
                
                if (!paymentTable) return null;
                
                return (
                  <Card key={order.id} className="border shadow-sm">
                    <CardContent className="p-6">
                      <div className="font-medium text-lg mb-1">{order.customerName}</div>
                      <div className="text-sm text-gray-600 mb-3">Pedido: {order.id}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-700">
                            Total: {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          <div className="text-sm font-semibold text-blue-600 mt-1">
                            Tabela: {paymentTable.name}
                          </div>
                        </div>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 flex gap-1"
                          onClick={() => handleViewPromissoryNote(order.id)}
                        >
                          <FileText size={16} className="mr-1" /> Visualizar Promissória
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Não há pedidos com notas promissórias
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PromissoryNotesTab;
