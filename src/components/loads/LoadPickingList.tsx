
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { Printer, PackageCheck, TruckIcon, CreditCard } from 'lucide-react';

interface LoadPickingListProps {
  orders: Order[];
  onClose: () => void;
  loadName?: string;
}

interface AggregatedProduct {
  productId: string;
  productCode: string | number;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

const LoadPickingList = ({ orders, onClose, loadName = "Carregamento" }: LoadPickingListProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Função que agrupa os produtos de todos os pedidos para separação
  const getAggregatedProducts = () => {
    const productsMap = new Map<string, AggregatedProduct>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existingProduct = productsMap.get(item.productId);
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
          existingProduct.total += item.total;
        } else {
          productsMap.set(item.productId, {
            productId: item.productId,
            productCode: item.productCode || 0,
            productName: item.productName,
            quantity: item.quantity,
            unit: 'un', // Unidade padrão
            unitPrice: item.unitPrice,
            total: item.total
          });
        }
      });
    });
    
    return Array.from(productsMap.values());
  };
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Romaneio_Separacao_${loadName.replace(/\s/g, '_')}`,
    onAfterPrint: onClose,
  });
  
  const aggregatedProducts = getAggregatedProducts();
  
  // Calcular o total de valor da carga
  const totalValue = aggregatedProducts.reduce((sum, product) => sum + product.total, 0);
  
  // Número de entregas (pedidos)
  const deliveryCount = orders.length;
  
  return (
    <div className="space-y-4">
      {/* Versão para impressão */}
      <div ref={componentRef} className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Romaneio de Separação</h1>
          <p className="text-gray-500">{loadName} - Data: {formatDateToBR(new Date())}</p>
        </div>
        
        {/* Resumo do carregamento */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <PackageCheck className="text-sales-800" size={20} />
              <h3 className="font-medium">Produtos Distintos</h3>
            </div>
            <p className="text-2xl font-bold">{aggregatedProducts.length}</p>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <TruckIcon className="text-sales-800" size={20} />
              <h3 className="font-medium">Entregas</h3>
            </div>
            <p className="text-2xl font-bold">{deliveryCount}</p>
          </div>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="text-sales-800" size={20} />
              <h3 className="font-medium">Valor Total</h3>
            </div>
            <p className="text-2xl font-bold">
              {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>
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
                <th className="border p-2 text-right">Valor Unit.</th>
                <th className="border p-2 text-right">Total</th>
                <th className="border p-2 text-center">Conferido</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="border p-2">{product.productCode}</td>
                  <td className="border p-2">{product.productName}</td>
                  <td className="border p-2 text-center">{product.quantity}</td>
                  <td className="border p-2 text-center">{product.unit}</td>
                  <td className="border p-2 text-right">
                    {product.unitPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td className="border p-2 text-right">
                    {product.total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td className="border p-2 text-center h-8">□</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border p-2" colSpan={4}>TOTAL</td>
                <td className="border p-2 text-right" colSpan={2}>
                  {totalValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </td>
                <td className="border p-2"></td>
              </tr>
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
