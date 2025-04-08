
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { Printer } from 'lucide-react';

interface LoadPickingListProps {
  orders: Order[];
  onClose: () => void;
}

const LoadPickingList = ({ orders, onClose }: LoadPickingListProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Função que agrupa os produtos de todos os pedidos para separação
  const getAggregatedProducts = () => {
    const productsMap = new Map();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existingProduct = productsMap.get(item.productId);
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
        } else {
          productsMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unit: 'un', // Assumimos unidade padrão (pode ser melhorado se o OrderItem incluir a unidade)
          });
        }
      });
    });
    
    return Array.from(productsMap.values());
  };
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Romaneio_Separacao_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: onClose,
  });
  
  const aggregatedProducts = getAggregatedProducts();
  
  return (
    <div className="space-y-4">
      {/* Versão para impressão */}
      <div ref={componentRef} className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Romaneio de Separação</h1>
          <p className="text-gray-500">Data: {formatDateToBR(new Date())}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Produtos para Separação</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Código</th>
                <th className="border p-2 text-left">Produto</th>
                <th className="border p-2 text-center">Qtd.</th>
                <th className="border p-2 text-center">Un.</th>
                <th className="border p-2 text-center">Conferido</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="border p-2">{product.productId}</td>
                  <td className="border p-2">{product.productName}</td>
                  <td className="border p-2 text-center">{product.quantity}</td>
                  <td className="border p-2 text-center">{product.unit}</td>
                  <td className="border p-2 text-center h-8">□</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Pedidos Incluídos</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Nº Pedido</th>
                <th className="border p-2 text-left">Cliente</th>
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2">{order.id}</td>
                  <td className="border p-2">{order.customerName}</td>
                  <td className="border p-2">{formatDateToBR(order.createdAt)}</td>
                  <td className="border p-2 text-right">
                    {order.total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 text-center">
          <p>Assinatura do responsável: ___________________________________</p>
        </div>
      </div>
      
      {/* Botões de ação - não aparecerão na impressão */}
      <div className="flex justify-end print:hidden">
        <Button 
          onClick={handlePrint} 
          className="bg-sales-800 hover:bg-sales-700"
        >
          <Printer size={16} className="mr-2" /> Imprimir
        </Button>
      </div>
    </div>
  );
};

export default LoadPickingList;
