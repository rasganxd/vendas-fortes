
import { useState } from 'react';
import { Load, LoadItem, Order, OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/hooks/useAppContext';
import { v4 as uuid } from 'uuid';

interface LoadOrdersTabProps {
  currentItems: LoadItem[];
  setCurrentItems: (items: LoadItem[]) => void;
}

export const LoadOrdersTab = ({ currentItems, setCurrentItems }: LoadOrdersTabProps) => {
  const [search, setSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const { orders, customers } = useAppContext();

  // Get customer code and order total
  const getOrderInfo = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { customerCode: "-", orderTotal: 0 };
    
    const customer = customers.find(c => c.id === order.customerId);
    const customerCode = customer?.code || "-";
    const orderTotal = order.total;
    
    return { customerCode, orderTotal };
  };

  // Filter orders that aren't already part of the load
  const filteredOrders = orders.filter(order => {
    const isInLoad = currentItems.some(item => item.orderId === order.id);
    const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.toLowerCase().includes(search.toLowerCase());
    return !isInLoad && matchesSearch;
  });

  const handleOrderSelect = (order: Order, isChecked: boolean) => {
    if (isChecked) {
      if (!selectedOrderIds.includes(order.id)) {
        setSelectedOrderIds(prev => [...prev, order.id]);
      }
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
    }
  };

  const handleAddSelectedOrders = () => {
    if (selectedOrderIds.length === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione pelo menos um pedido para adicionar à carga.",
        variant: "destructive"
      });
      return;
    }

    const ordersToAdd = orders.filter(order => selectedOrderIds.includes(order.id));
    
    const newLoadItems: LoadItem[] = [];
    ordersToAdd.forEach(order => {
      order.items.forEach(item => {
        newLoadItems.push({
          id: uuid(),
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          orderItems: [item],
          price: item.price, // Add price property
          customerId: order.customerId // Add customerId for consistency
        });
      });
    });

    setCurrentItems([...currentItems, ...newLoadItems]);
    setSelectedOrderIds([]);
    setSearch('');
    
    toast({
      title: "Pedidos adicionados",
      description: `${ordersToAdd.length} pedido(s) adicionado(s) à carga.`
    });
  };

  const handleRemoveOrder = (orderId: string) => {
    setCurrentItems(currentItems.filter(item => item.orderId !== orderId));
    
    toast({
      title: "Pedido removido",
      description: "O pedido foi removido da carga."
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Pedidos na Carga</h3>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Cliente</TableHead>
                <TableHead>Total Pedido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(
                new Set(currentItems.map(item => item.orderId))
              ).map(orderId => {
                const { customerCode, orderTotal } = orderId ? getOrderInfo(orderId) : { customerCode: "-", orderTotal: 0 };
                return (
                  <TableRow key={orderId}>
                    <TableCell>{customerCode}</TableCell>
                    <TableCell>R$ {orderTotal.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOrder(orderId || '')}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash size={16} />
                        <span className="ml-1">Remover</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {currentItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Nenhum pedido adicionado à carga
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium mb-2">Adicionar Pedidos</h3>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Buscar pedidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            className="bg-sales-800 hover:bg-sales-700" 
            onClick={handleAddSelectedOrders}
            disabled={selectedOrderIds.length === 0}
          >
            <Plus size={16} className="mr-2" /> Adicionar
          </Button>
        </div>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Sel.</TableHead>
                <TableHead>Código Cliente</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Itens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                const customerCode = customer?.code || "-";
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => handleOrderSelect(order, !!checked)}
                      />
                    </TableCell>
                    <TableCell>{customerCode}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.items.length} item(s)</TableCell>
                  </TableRow>
                );
              })}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Não há pedidos disponíveis para adicionar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
