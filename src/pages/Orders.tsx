
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDateToBR } from '@/lib/date-utils';
import { Search, Plus, Eye, Printer, FilePenLine } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Order, Customer } from '@/types';
import { useReactToPrint } from 'react-to-print';

export default function Orders() {
  const navigate = useNavigate();
  const { orders, customers } = useAppContext();
  const [search, setSearch] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido-${selectedOrder?.id}`,
  });

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    const customer = customers.find(c => c.id === order.customerId);
    setSelectedCustomer(customer || null);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendente</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500">Parcial</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PageLayout title="Pedidos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Pedidos</CardTitle>
              <CardDescription>Visualize e gerencie os pedidos</CardDescription>
            </div>
            <Button className="bg-sales-800 hover:bg-sales-700" onClick={() => navigate('/pedidos/novo')}>
              <Plus size={16} className="mr-2" /> Novo Pedido
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDateToBR(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FilePenLine size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Detalhes do Pedido</span>
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1">
                <Printer size={16} /> Imprimir
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div ref={printRef} className="p-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">PEDIDO Nº {selectedOrder?.id}</h2>
              <p className="text-gray-600">
                Data: {selectedOrder ? formatDateToBR(selectedOrder.createdAt) : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">Dados do Cliente</h3>
                <p><span className="font-semibold">Nome:</span> {selectedCustomer?.name}</p>
                <p><span className="font-semibold">Telefone:</span> {selectedCustomer?.phone}</p>
                <p><span className="font-semibold">E-mail:</span> {selectedCustomer?.email}</p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                <p>{selectedCustomer?.address}</p>
                <p>{selectedCustomer?.city} - {selectedCustomer?.state}, {selectedCustomer?.zipCode}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Itens do Pedido</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left">Produto</th>
                      <th className="py-2 px-4 text-center">Quantidade</th>
                      <th className="py-2 px-4 text-right">Preço Unit.</th>
                      <th className="py-2 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-4">{item.productName}</td>
                        <td className="py-2 px-4 text-center">{item.quantity}</td>
                        <td className="py-2 px-4 text-right">
                          {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2 px-4 text-right font-medium">
                          {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="font-semibold">Status: {selectedOrder?.status}</p>
                <p className="font-semibold">Pagamento: {selectedOrder?.paymentStatus}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Subtotal: 
                  {selectedOrder?.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="font-bold text-lg">Total: 
                  {selectedOrder?.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            
            {selectedOrder?.notes && (
              <div className="mt-4">
                <h3 className="font-semibold">Observações:</h3>
                <p className="text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}
            
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>ForcaVendas - Sistema de Gestão de Vendas</p>
              <p>Para qualquer suporte: (11) 9999-8888</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
