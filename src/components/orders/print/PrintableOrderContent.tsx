
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
              <div className="text-center mb-3">
                <h1 className="text-xl font-bold">{companyData?.name || 'Empresa'}</h1>
                <p className="text-sm">Data: {formatDateToBR(order.createdAt)}</p>
              </div>
              
              {/* Dados do Cliente */}
              <div className="border rounded mb-2 p-2">
                <h2 className="font-bold mb-1 text-sm">Cliente</h2>
                <p className="text-xs"><span className="font-medium">Nome:</span> {orderCustomer?.name}</p>
                <p className="text-xs"><span className="font-medium">Tel:</span> {orderCustomer?.phone}</p>
                {orderCustomer?.document && (
                  <p className="text-xs"><span className="font-medium">CPF/CNPJ:</span> {orderCustomer?.document}</p>
                )}
              </div>
              
              {/* Endereço de Entrega - Condensado */}
              {(orderCustomer?.address || order.deliveryAddress) && (
                <div className="border rounded mb-2 p-2">
                  <h2 className="font-bold mb-1 text-sm">Endereço de Entrega</h2>
                  <p className="text-xs">
                    {order.deliveryAddress || orderCustomer?.address}
                    {(order.deliveryCity || orderCustomer?.city) && (
                      <>{', '}{order.deliveryCity || orderCustomer?.city}</>
                    )}
                    {(order.deliveryState || orderCustomer?.state) && (
                      <>{' - '}{order.deliveryState || orderCustomer?.state}</>
                    )}
                  </p>
                </div>
              )}
              
              {/* Itens do Pedido */}
              <div className="mb-2">
                <h2 className="font-bold mb-1 text-sm">Itens do Pedido</h2>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1 text-left">Produto</th>
                      <th className="border p-1 text-center">Qtd</th>
                      <th className="border p-1 text-right">Preço</th>
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
              </div>
              
              {/* Totais - Mais compacto */}
              <div className="flex justify-end mb-2">
                <div className="text-right text-sm">
                  <p className="font-bold">Total: {formatCurrency(order.total)}</p>
                </div>
              </div>
              
              {/* Observações - Se houver */}
              {order.notes && (
                <div className="text-xs mb-2">
                  <p className="font-medium">Obs:</p>
                  <p>{order.notes}</p>
                </div>
              )}
              
              {/* Rodapé do pedido */}
              <div className="text-center text-xs mt-4 pt-1 border-t">
                {companyData?.name && (
                  <p>{companyData.name} - Sistema de Gestão de Vendas</p>
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
