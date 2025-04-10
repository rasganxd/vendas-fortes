
import React from 'react';
import { Order, Customer } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';

interface PrintableOrderContentProps {
  orders: Order[];
  customers: Customer[];
  formatCurrency: (value: number | undefined) => string;
}

const PrintableOrderContent: React.FC<PrintableOrderContentProps> = ({
  orders,
  customers,
  formatCurrency
}) => {
  // Function to get a human-readable payment method name
  const getPaymentMethodName = (order: Order) => {
    if (!order.paymentMethod) return 'Não especificado';
    
    switch(order.paymentMethod.toLowerCase()) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao': return 'Cartão';
      case 'cheque': return 'Cheque';
      case 'boleto': return 'Boleto';
      case 'pix': return 'PIX';
      case 'promissoria': return 'Nota Promissória';
      default: return order.paymentMethod;
    }
  }

  return (
    <div className="hidden">
      <div className="p-4">
        {orders.map((order, orderIndex) => {
          const orderCustomer = customers.find(c => c.id === order.customerId);
          
          const needsPageBreak = (orderIndex + 1) % 2 === 0 && orderIndex < orders.length - 1;
          
          return (
            <div key={order.id}>
              <div className="print-order">
                <div className="text-center mb-4">
                  <p className="text-gray-600">
                    Data: {formatDateToBR(order.createdAt)}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="border rounded-md p-3">
                    <h3 className="font-semibold mb-1">Dados do Cliente</h3>
                    <p><span className="font-semibold">Nome:</span> {orderCustomer?.name}</p>
                    <p><span className="font-semibold">Telefone:</span> {orderCustomer?.phone}</p>
                    <p><span className="font-semibold">CPF/CNPJ:</span> {orderCustomer?.document}</p>
                    <p><span className="font-semibold">Endereço:</span> {orderCustomer?.address}</p>
                    <p>{orderCustomer?.city} - {orderCustomer?.state}, {orderCustomer?.zipCode}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Itens do Pedido</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="py-1 px-2 text-left">Produto</th>
                          <th className="py-1 px-2 text-center">Qtd.</th>
                          <th className="py-1 px-2 text-right">Preço</th>
                          <th className="py-1 px-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-1 px-2">{item.productName}</td>
                            <td className="py-1 px-2 text-center">{item.quantity}</td>
                            <td className="py-1 px-2 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-1 px-2 text-right font-medium">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div>
                    {/* Display payment status and payment method */}
                    <p className="font-semibold">
                      {order.paymentStatus === 'paid' ? 'Pago' : 
                       order.paymentStatus === 'partial' ? 'Pago Parcialmente' : 
                       'Pendente'}
                    </p>
                    {/* Show the correct payment method name */}
                    <p className="text-sm">
                      <span className="font-medium">Forma de Pagamento:</span> {getPaymentMethodName(order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Total: 
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mt-2">
                    <h3 className="font-semibold text-sm">Observações:</h3>
                    <p className="text-gray-700 text-sm">{order.notes}</p>
                  </div>
                )}
              </div>
              
              {needsPageBreak && <div className="print-page-break"></div>}
            </div>
          );
        })}
        
        <div className="print-footer">
          <p>ForcaVendas - Sistema de Gestão de Vendas</p>
          <p>Para qualquer suporte: (11) 9999-8888</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableOrderContent;
