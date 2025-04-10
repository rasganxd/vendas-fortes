
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DeliveryRoute, Order } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { Printer, CreditCard, Receipt, DollarSign, FileText } from 'lucide-react';

interface RouteFinancialReportProps {
  route: DeliveryRoute;
  orders: Order[];
  onClose: () => void;
}

const RouteFinancialReport = ({ route, orders, onClose }: RouteFinancialReportProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Calculate the total value of all orders in the route
  const totalRouteValue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Get payment method display name - Updated for proper mapping
  const getPaymentMethodName = (paymentStatus: string, method?: string) => {
    if (paymentStatus === 'pending') return 'A prazo';
    
    if (method) {
      switch(method.toLowerCase()) {
        case 'dinheiro': return 'À vista (Dinheiro)';
        case 'cartao': return 'Cartão de Crédito';
        case 'cheque': return 'Cheque';
        case 'boleto': return 'Boleto';
        case 'pix': return 'PIX';
        case 'promissoria': return 'Nota Promissória';
        default: return method;
      }
    }
    
    return paymentStatus === 'paid' ? 'À vista' : 'A prazo';
  };
  
  // Get payment method icon
  const getPaymentIcon = (paymentStatus: string, method?: string) => {
    if (paymentStatus === 'pending') return FileText;
    
    if (method) {
      switch(method.toLowerCase()) {
        case 'dinheiro': return DollarSign;
        case 'cartao': return CreditCard;
        case 'pix': 
        case 'boleto': return Receipt;
        case 'cheque': 
        case 'promissoria': return FileText;
        default: return Receipt;
      }
    }
    
    return Receipt;
  };
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Financeiro_Rota_${route.name.replace(/\s/g, '_')}`,
    onAfterPrint: onClose,
  });
  
  return (
    <div className="space-y-4">
      {/* Versão para impressão */}
      <div ref={componentRef} className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Relatório Financeiro de Rota</h1>
          <p className="text-gray-500">{route.name} - Data: {formatDateToBR(route.date)}</p>
        </div>
        
        {/* Resumo financeiro da rota */}
        <div className="border rounded-md p-4 bg-gray-50 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-lg">Total da Rota:</h3>
              <p className="text-sm text-gray-600">{orders.length} pedidos</p>
            </div>
            <p className="text-2xl font-bold">
              {totalRouteValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Pedidos por Cliente</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Cliente</th>
                <th className="border p-2 text-left">Nº Pedido</th>
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-center">Forma de Pagamento</th>
                <th className="border p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                // Find payment method from related payments if available
                const paymentMethod = order.paymentMethod || '';
                const PaymentIcon = getPaymentIcon(order.paymentStatus, paymentMethod);
                
                return (
                  <tr key={order.id}>
                    <td className="border p-2">{order.customerName}</td>
                    <td className="border p-2">{order.id}</td>
                    <td className="border p-2">{formatDateToBR(order.createdAt)}</td>
                    <td className="border p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <PaymentIcon size={14} className="text-gray-600" />
                        <span>{getPaymentMethodName(order.paymentStatus, paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="border p-2 text-right">
                      {order.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-100 font-bold">
                <td className="border p-2" colSpan={4}>TOTAL</td>
                <td className="border p-2 text-right">
                  {totalRouteValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <Separator className="my-6" />
        
        <div className="mt-8">
          <div className="flex justify-between">
            <div>
              <p><span className="font-medium">Motorista:</span> {route.driverName || 'Não atribuído'}</p>
              <p><span className="font-medium">Veículo:</span> {route.vehicleName || 'Não atribuído'}</p>
            </div>
            <div className="text-right">
              <p className="mt-12">___________________________________</p>
              <p>Assinatura do responsável</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botões de ação - não aparecerão na impressão */}
      <div className="flex justify-end print:hidden">
        <Button 
          onClick={handlePrint} 
          className="bg-sales-800 hover:bg-sales-700"
        >
          <Printer size={16} className="mr-2" /> Imprimir Relatório
        </Button>
      </div>
    </div>
  );
};

export default RouteFinancialReport;
