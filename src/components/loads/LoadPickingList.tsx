
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
      <div ref={componentRef} className="p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-sales-800">Romaneio de Separação</h1>
          <p className="text-gray-500">{loadName} - Data: {formatDateToBR(new Date())}</p>
        </div>
        
        {/* Resumo do carregamento */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="bg-gray-50">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Package className="text-sales-800" size={18} />
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xl font-bold text-sales-800">{aggregatedProducts.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <TruckIcon className="text-sales-800" size={18} />
                <CardTitle className="text-sm font-medium">Entregas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xl font-bold text-sales-800">{deliveryCount}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <FileText className="text-sales-800" size={18} />
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xl font-bold text-sales-800">
                {totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabela simplificada de produtos */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-sales-50 text-sales-800">
              <th className="border p-2 text-left">Código</th>
              <th className="border p-2 text-left">Produto</th>
              <th className="border p-2 text-center">Qtd.</th>
              <th className="border p-2 text-right">Valor Unit.</th>
              <th className="border p-2 text-right">Total</th>
              <th className="border p-2 text-center">Conferido</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedProducts.map((product) => (
              <tr key={product.productId} className="hover:bg-gray-50">
                <td className="border p-2">{product.productCode}</td>
                <td className="border p-2">{product.productName}</td>
                <td className="border p-2 text-center">{product.quantity}</td>
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
                <td className="border p-2 text-center">
                  <div className="h-5 w-5 border border-gray-400 rounded-sm mx-auto"></div>
                </td>
              </tr>
            ))}
            <tr className="bg-sales-50 font-bold text-sales-800">
              <td className="border p-2" colSpan={4}>TOTAL</td>
              <td className="border p-2 text-right">
                {totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </td>
              <td className="border p-2"></td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-6">
          <div className="border-t pt-4">
            <p className="text-center">Assinatura do responsável: ___________________________________</p>
          </div>
        </div>
      </div>
      
      {/* Botões de ação - não aparecerão na impressão */}
      <div className="flex justify-end print:hidden">
        <Button 
          onClick={handlePrint} 
          className="bg-sales-800 hover:bg-sales-700 flex gap-2 items-center"
        >
          <Printer size={16} /> Imprimir Romaneio
        </Button>
      </div>
    </div>
  );
};

export default LoadPickingList;
