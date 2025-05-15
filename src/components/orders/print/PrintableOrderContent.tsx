
import React from 'react';
import { Order, Customer, PaymentStatus } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { useAppContext } from '@/hooks/useAppContext';

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
  const { settings } = useAppContext();
  const companyData = settings?.company;

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
    <div className="hidden print:block">
      <div className="print-orders-container">
        {orders.map((order, orderIndex) => {
          const orderCustomer = customers.find(c => c.id === order.customerId);
          
          return (
            <div key={order.id} className="print-order">
              {/* Company header for each order */}
              {companyData?.name && (
                <div className="text-center mb-2">
                  <h2 className="font-bold text-lg">{companyData.name}</h2>
                  {companyData.document && (
                    <p className="text-sm text-gray-600">CNPJ: {companyData.document}</p>
                  )}
                  {companyData.address && (
                    <p className="text-xs text-gray-600">{companyData.address}</p>
                  )}
                  {(companyData.phone || companyData.email) && (
                    <p className="text-xs text-gray-600">
                      {companyData.phone}{companyData.phone && companyData.email ? ' | ' : ''}
                      {companyData.email}
                    </p>
                  )}
                </div>
              )}

              <div className="text-center mb-2">
                <h3 className="font-bold">Pedido #{order.code}</h3>
                <p className="text-gray-600 text-xs">
                  Data: {formatDateToBR(order.createdAt)}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 mb-2">
                <div className="border rounded-md p-2">
                  <h3 className="font-semibold mb-1 text-sm">Dados do Cliente</h3>
                  <p className="text-xs"><span className="font-semibold">Nome:</span> {orderCustomer?.name}</p>
                  <p className="text-xs"><span className="font-semibold">Telefone:</span> {orderCustomer?.phone}</p>
                  {orderCustomer?.document && (
                    <p className="text-xs"><span className="font-semibold">CPF/CNPJ:</span> {orderCustomer?.document}</p>
                  )}
                  {orderCustomer?.address && (
                    <p className="text-xs"><span className="font-semibold">Endereço:</span> {orderCustomer?.address}</p>
                  )}
                  {orderCustomer?.city && (
                    <p className="text-xs">{orderCustomer?.city} - {orderCustomer?.state}, {orderCustomer?.zipCode}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <h3 className="font-semibold mb-1 text-sm">Itens do Pedido</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="py-1 px-1 text-left">Produto</th>
                        <th className="py-1 px-1 text-center">Qtd.</th>
                        <th className="py-1 px-1 text-right">Preço</th>
                        <th className="py-1 px-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-1 px-1">{item.productName}</td>
                          <td className="py-1 px-1 text-center">{item.quantity}</td>
                          <td className="py-1 px-1 text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-1 px-1 text-right font-medium">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <div>
                  <p className="font-semibold text-xs">
                    {order.paymentStatus === 'paid' ? 'Pago' : 
                     order.paymentStatus === 'partial' ? 'Pago Parcialmente' : 
                     'Pendente'}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Forma de Pagamento:</span> {getPaymentMethodName(order)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">Total: 
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
              
              {order.notes && (
                <div className="mt-1">
                  <h3 className="font-semibold text-xs">Observações:</h3>
                  <p className="text-gray-700 text-xs">{order.notes}</p>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="print-footer">
          {companyData?.footer ? (
            <p>{companyData.footer}</p>
          ) : (
            <>
              <p>{companyData?.name || 'ForcaVendas'} - Sistema de Gestão de Vendas</p>
              <p>Para qualquer suporte: {companyData?.phone || '(11) 9999-8888'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintableOrderContent;
