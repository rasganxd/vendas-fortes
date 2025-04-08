
import { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { DeliveryRoute, OrderItem, Order, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Printer, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

interface RouteProductsListProps {
  route: DeliveryRoute | null;
}

interface AggregatedProduct {
  id: string;
  code?: number;  // Added code field
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const RouteProductsList = ({ route }: RouteProductsListProps) => {
  const { orders, products } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aggregatedProducts, setAggregatedProducts] = useState<AggregatedProduct[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (route) {
      // Get all order IDs from the route stops
      const orderIds = route.stops.map(stop => stop.orderId);
      
      // Get the actual orders
      const routeOrders = orders.filter(order => orderIds.includes(order.id));
      
      // Aggregate all products from all orders
      const productsMap = new Map<string, AggregatedProduct>();
      
      routeOrders.forEach(order => {
        order.items.forEach(item => {
          const productInfo = products.find(p => p.id === item.productId);
          const unit = productInfo?.unit || '';
          const code = productInfo?.code;
          
          if (productsMap.has(item.productId)) {
            const existingProduct = productsMap.get(item.productId)!;
            existingProduct.quantity += item.quantity;
            existingProduct.total += item.total;
          } else {
            productsMap.set(item.productId, {
              id: item.productId,
              code: code,  // Added code
              name: item.productName,
              quantity: item.quantity,
              unit,
              unitPrice: item.unitPrice,
              total: item.total
            });
          }
        });
      });
      
      // Convert map to array and sort by name
      const aggregated = Array.from(productsMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setAggregatedProducts(aggregated);
      
      // Calculate total value of all products
      const total = aggregated.reduce((sum, product) => sum + product.total, 0);
      setTotalValue(total);
    }
  }, [route, orders, products]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Lista de Produtos - ${route?.name}`,
  });

  if (!route) return null;

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => setIsDialogOpen(true)}
      >
        <FileText size={16} />
        Lista de Produtos
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lista de Produtos - {route.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700">
                <Printer size={16} className="mr-2" /> Imprimir Lista
              </Button>
            </div>
            
            <div ref={printRef} className="p-4">
              <h2 className="text-xl font-bold mb-2">Lista de Produtos - {route.name}</h2>
              <p className="text-gray-500 mb-4">Total de produtos: {aggregatedProducts.length}</p>
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left">Cód</th>
                      <th className="py-2 px-4 text-left">Produto</th>
                      <th className="py-2 px-4 text-right">Quantidade</th>
                      <th className="py-2 px-4 text-right">Unid.</th>
                      <th className="py-2 px-4 text-right">Preço Unit.</th>
                      <th className="py-2 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedProducts.map(product => (
                      <tr key={product.id} className="border-b">
                        <td className="py-2 px-4">{product.code || '-'}</td>
                        <td className="py-2 px-4 font-medium">{product.name}</td>
                        <td className="py-2 px-4 text-right">{product.quantity}</td>
                        <td className="py-2 px-4 text-right">{product.unit}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(product.unitPrice)}</td>
                        <td className="py-2 px-4 text-right font-medium">{formatCurrency(product.total)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="py-3 px-4 font-bold text-right">Valor Total:</td>
                      <td className="py-3 px-4 text-right font-bold">{formatCurrency(totalValue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
