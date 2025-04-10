
import React, { useState, useEffect } from 'react';
import { Customer, Order, PaymentTable } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/useAppContext';
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';
import { formatDateToBR } from '@/lib/date-utils';

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
  payments: any[];
}

const PromissoryNotesTab: React.FC<PromissoryNotesTabProps> = ({
  pendingPaymentOrders,
  paymentTables,
  customers,
  orders,
  payments
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

  // Get all orders that use promissory notes OR have promissory payments
  const getPromissoryNoteOrders = () => {
    // Get orders with promissory notes payment method
    const promissoryOrders = orders.filter(order => {
      // Check if payment method is promissory note
      if (order.paymentMethod === 'promissoria') return true;
      
      // Check if payment table is a promissory note type
      const paymentTable = order.paymentTableId ? 
        allPaymentTables.find(pt => pt.id === order.paymentTableId) : null;
      
      return paymentTable?.type === 'promissory_note';
    });
    
    // Get orders that have promissory note payments
    const ordersWithPromissoryPayments = orders.filter(order => 
      payments.some(p => p.orderId === order.id && p.method === 'promissoria')
    );
    
    // Combine both lists and remove duplicates
    const combinedOrders = [...promissoryOrders, ...ordersWithPromissoryPayments];
    const uniqueOrders = Array.from(new Map(combinedOrders.map(order => [order.id, order])).values());
    
    return uniqueOrders;
  };

  // Filter orders by search term
  const filteredOrders = getPromissoryNoteOrders().filter(order => {
    return search === '' || 
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
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
                
                // Find promissory note payment for this order
                const promissoryPayment = payments.find(
                  p => p.orderId === order.id && p.method === 'promissoria'
                );
                
                return (
                  <Card key={order.id} className="border shadow-sm">
                    <CardContent className="p-6">
                      <div className="font-medium text-lg mb-1">{order.customerName}</div>
                      <div className="text-sm text-gray-600 mb-3">
                        Pedido: {order.id}
                        {order.createdAt && (
                          <span className="ml-2">
                            ({formatDateToBR(order.createdAt)})
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-700">
                            Total: {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          {paymentTable && (
                            <div className="text-sm font-semibold text-blue-600 mt-1">
                              Tabela: {paymentTable.name}
                            </div>
                          )}
                          {promissoryPayment && (
                            <div className="text-sm text-green-600 mt-1">
                              Nota Promissória Registrada
                            </div>
                          )}
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
