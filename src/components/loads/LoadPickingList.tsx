
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { Printer, Package, TruckIcon, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  ordersContaining: string[]; // Track which orders contain this product
}

const LoadPickingList = ({
  orders,
  onClose,
  loadName = "Carregamento"
}: LoadPickingListProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  // Função que agrupa os produtos de todos os pedidos para separação
  const getAggregatedProducts = () => {
    const productsMap = new Map<string, AggregatedProduct>();
    orders.forEach(order => {
      order.items.forEach(item => {
        // Include unit in the key to separate products with different units
        const key = `${item.productCode}-${item.productName}-${item.unit || 'UN'}`;
        const existingProduct = productsMap.get(key);
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
          existingProduct.total += item.total;
          existingProduct.ordersContaining.push(order.id.substring(0, 8));
        } else {
          productsMap.set(key, {
            productId: item.productId || item.id,
            productCode: item.productCode || 0,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit || 'UN',
            unitPrice: item.unitPrice,
            total: item.total,
            ordersContaining: [order.id.substring(0, 8)]
          });
        }
      });
    });
    return Array.from(productsMap.values()).sort((a, b) => String(a.productCode).localeCompare(String(b.productCode)));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Romaneio_Separacao_${loadName.replace(/\s/g, '_')}`,
    onAfterPrint: onClose
  });

  const aggregatedProducts = getAggregatedProducts();

  // Calcular o total de valor da carga
  const totalValue = aggregatedProducts.reduce((sum, product) => sum + product.total, 0);

  // Número de entregas (pedidos)
  const deliveryCount = orders.length;

  return (
    <div className="space-y-4">
      {/* Versão para impressão */}
      <div ref={componentRef} className="p-4 print:p-8">
        <div className="text-center mb-6 print:mb-8">
          <h1 className="text-3xl font-bold text-sales-800 print:text-black">Romaneio de Separação</h1>
          <p className="text-gray-600 print:text-gray-800 text-lg mt-2">
            {loadName} - Data: {formatDateToBR(new Date())}
          </p>
        </div>
        
        {/* Resumo do carregamento */}
        <div className="grid grid-cols-3 gap-4 mb-6 print:mb-8">
          <Card className="bg-gray-50 print:bg-white print:border-2">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Package className="text-sales-800 print:text-black" size={18} />
                <CardTitle className="text-sm font-medium">Produtos Únicos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xl font-bold text-sales-800 print:text-black">{aggregatedProducts.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 print:bg-white print:border-2">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <TruckIcon className="text-sales-800 print:text-black" size={18} />
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xl font-bold text-sales-800 print:text-black">{deliveryCount}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 print:bg-white print:border-2">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <FileText className="text-sales-800 print:text-black" size={18} />
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xl font-bold text-sales-800 print:text-black">
                {totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabela de produtos para separação */}
        <table className="w-full border-collapse text-sm print:text-xs">
          <thead>
            <tr className="bg-sales-50 print:bg-gray-100 text-sales-800 print:text-black">
              <th className="border border-gray-400 p-2 text-left font-bold">Código</th>
              <th className="border border-gray-400 p-2 text-left font-bold">Produto</th>
              <th className="border border-gray-400 p-2 text-center font-bold">Qtd. Total</th>
              <th className="border border-gray-400 p-2 text-center font-bold">Unidade</th>
              <th className="border border-gray-400 p-2 text-right font-bold">Valor Unit.</th>
              <th className="border border-gray-400 p-2 text-right font-bold">Total</th>
              <th className="border border-gray-400 p-2 text-center font-bold">Conferido</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 print:hover:bg-white">
                <td className="border border-gray-400 p-2 font-mono">{product.productCode}</td>
                <td className="border border-gray-400 p-2">{product.productName}</td>
                <td className="border border-gray-400 p-2 text-center font-bold">{product.quantity}</td>
                <td className="border border-gray-400 p-2 text-center">{product.unit}</td>
                <td className="border border-gray-400 p-2 text-right">
                  {product.unitPrice.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </td>
                <td className="border border-gray-400 p-2 text-right font-bold">
                  {product.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  <div className="h-5 w-5 border-2 border-gray-400 rounded-sm mx-auto print:border-black"></div>
                </td>
              </tr>
            ))}
            <tr className="bg-sales-50 print:bg-gray-100 font-bold text-sales-800 print:text-black">
              <td className="border border-gray-400 p-2" colSpan={5}>TOTAL GERAL</td>
              <td className="border border-gray-400 p-2 text-right font-bold">
                {totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </td>
              <td className="border border-gray-400 p-2"></td>
            </tr>
          </tbody>
        </table>
        
        {/* Lista de pedidos incluídos */}
        <div className="mt-6 print:mt-8">
          <h3 className="text-lg font-bold text-sales-800 print:text-black mb-4">
            Pedidos Incluídos no Carregamento
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {orders.map(order => (
              <div key={order.id} className="bg-gray-50 print:bg-white p-2 rounded border print:border-gray-400">
                <span className="font-mono text-xs">#{order.code}</span> - {order.customerName}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 print:mt-12">
          <div className="border-t-2 border-gray-400 print:border-black pt-4">
            <p className="text-center text-lg print:text-base">
              Assinatura do responsável pela separação: ___________________________________
            </p>
            <p className="text-center text-sm text-gray-600 print:text-gray-800 mt-4">
              Data: ___/___/_____ Hora: _____:_____
            </p>
          </div>
        </div>
      </div>
      
      {/* Botões de ação - não aparecerão na impressão */}
      <div className="flex justify-end space-x-2 print:hidden">
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
        <Button onClick={handlePrint} className="bg-sales-800 hover:bg-sales-700 flex gap-2 items-center">
          <Printer size={16} /> Imprimir Romaneio
        </Button>
      </div>
    </div>
  );
};

export default LoadPickingList;
