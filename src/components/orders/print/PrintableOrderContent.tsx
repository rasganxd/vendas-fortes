
import React from 'react';
import { Order, Customer, PaymentStatus } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { useAppContext } from '@/hooks/useAppContext';
import { formatCurrency } from '@/lib/format-utils';

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

  return (
    <div className="hidden print:block">
      <div className="print-orders-container">
        {orders.map((order, orderIndex) => {
          const orderCustomer = customers.find(c => c.id === order.customerId);
          
          return (
            <div key={order.id} className="print-order">
              {/* Cabeçalho com nome da empresa e data */}
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold">{companyData?.name || 'Empresa'}</h1>
                <p className="text-sm">Data: {formatDateToBR(order.createdAt)}</p>
              </div>
              
              {/* Dados do Cliente */}
              <div className="border rounded mb-4 p-3">
                <h2 className="font-bold mb-2">Dados do Cliente</h2>
                <p><span className="font-medium">Nome:</span> {orderCustomer?.name}</p>
                <p><span className="font-medium">Telefone:</span> {orderCustomer?.phone}</p>
                {orderCustomer?.document && (
                  <p><span className="font-medium">CPF/CNPJ:</span> {orderCustomer?.document}</p>
                )}
              </div>
              
              {/* Endereço de Entrega */}
              {(orderCustomer?.address || order.deliveryAddress) && (
                <div className="border rounded mb-4 p-3">
                  <h2 className="font-bold mb-2">Endereço de Entrega</h2>
                  <p>
                    {order.deliveryAddress || orderCustomer?.address}
                    {(order.deliveryCity || orderCustomer?.city) && (
                      <>{', '}{order.deliveryCity || orderCustomer?.city}</>
                    )}
                    {(order.deliveryState || orderCustomer?.state) && (
                      <>{' - '}{order.deliveryState || orderCustomer?.state}</>
                    )}
                    {(order.deliveryZip || orderCustomer?.zipCode) && (
                      <>{', '}{order.deliveryZip || orderCustomer?.zipCode}</>
                    )}
                  </p>
                </div>
              )}
              
              {/* Itens do Pedido */}
              <h2 className="font-bold mb-2">Itens do Pedido</h2>
              <table className="w-full mb-4 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1 text-left">Produto</th>
                    <th className="border p-1 text-center">Quantidade</th>
                    <th className="border p-1 text-right">Preço Unit.</th>
                    <th className="border p-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">{item.productName}</td>
                      <td className="border p-1 text-center">{item.quantity}</td>
                      <td className="border p-1 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border p-1 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Totais */}
              <div className="flex justify-end mb-4">
                <div className="text-right">
                  <p className="font-medium">Subtotal: {formatCurrency(order.total)}</p>
                  <p className="font-bold text-lg">Total: {formatCurrency(order.total)}</p>
                </div>
              </div>
              
              {/* Informações adicionais */}
              {order.notes && (
                <div className="mb-4">
                  <p className="font-medium">Observações:</p>
                  <p>{order.notes}</p>
                </div>
              )}
              
              {/* Rodapé do pedido */}
              <div className="text-center text-sm mt-8 pt-2 border-t">
                {companyData?.name ? (
                  <>
                    <p>{companyData.name} - Sistema de Gestão de Vendas</p>
                    {companyData.phone && <p>Para qualquer suporte: {companyData.phone}</p>}
                  </>
                ) : (
                  <p>Sistema de Gestão de Vendas</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrintableOrderContent;
