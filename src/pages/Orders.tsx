import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
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
import { Search, Plus, Eye, Printer, FilePenLine, Archive, Check, Trash, X } from 'lucide-react';
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
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Order, Customer } from '@/types';
import { useReactToPrint } from 'react-to-print';
import { Checkbox } from '@/components/ui/checkbox';

const printStyles = `
@media print {
  .print-order {
    width: 100%;
    padding: 10px;
    page-break-inside: avoid;
    box-sizing: border-box;
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
  
  .print-order table {
    width: 100%;
    font-size: 0.85rem;
  }
  
  .print-order h3 {
    font-size: 1rem;
  }
  
  .print-order p {
    margin: 0.2rem 0;
    font-size: 0.85rem;
  }
  
  .print-footer {
    padding-top: 20px;
    text-align: center;
  }
  
  .print-page-break {
    page-break-after: always;
    margin-bottom: 20px;
  }
  
  .no-print {
    display: none;
  }
  
  button, .no-print {
    display: none;
  }
}`;

export default function Orders() {
  const navigate = useNavigate();
  const { orders, customers } = useAppContext();
  const { deleteOrder } = useOrders();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  
  const printRef = useRef<HTMLDivElement>(null);
  const bulkPrintRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido-${selectedOrder?.customerName}`,
  });
  
  const handleBulkPrint = useReactToPrint({
    content: () => bulkPrintRef.current,
    documentTitle: 'Pedidos',
  });

  const filteredOrders = orders.filter(order => {
    if (!showArchived && order.archived) return false;
    return order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    const customer = customers.find(c => c.id === order.customerId);
    setSelectedCustomer(customer || null);
    setIsViewDialogOpen(true);
  };
  
  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditOrder = (order: Order) => {
    navigate(`/pedidos/novo?id=${order.id}`);
  };
  
  const confirmDeleteOrder = async () => {
    if (selectedOrder) {
      await deleteOrder(selectedOrder.id);
      setIsDeleteDialogOpen(false);
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
  
  const handleToggleOrderSelection = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };
  
  const handleSelectAllOrders = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(order => order.id));
    }
  };
  
  const getOrdersBySelection = () => {
    if (selectedCustomerId === 'all') {
      return selectedOrderIds.length > 0 
        ? orders.filter(order => selectedOrderIds.includes(order.id))
        : filteredOrders;
    } else {
      return orders.filter(order => order.customerId === selectedCustomerId);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <PageLayout title="Pedidos">
      <style>{printStyles}</style>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Pedidos</CardTitle>
              <CardDescription>Visualize e gerencie os pedidos</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPrintDialogOpen(true)}
                className="flex items-center"
                disabled={filteredOrders.length === 0}
              >
                <Printer size={16} className="mr-2" /> Imprimir Pedidos
              </Button>
              <Button className="bg-sales-800 hover:bg-sales-700" onClick={() => navigate('/pedidos/novo')}>
                <Plus size={16} className="mr-2" /> Novo Pedido
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showArchived" 
                checked={showArchived}
                onCheckedChange={(checked) => setShowArchived(checked as boolean)}
              />
              <label htmlFor="showArchived" className="text-sm flex items-center cursor-pointer">
                <Archive size={16} className="mr-1" /> Mostrar arquivados
              </label>
            </div>
          </div>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] px-2">
                    <Checkbox 
                      checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length} 
                      onCheckedChange={handleSelectAllOrders}
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhum pedido encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className={order.archived ? "bg-gray-50" : ""}>
                      <TableCell className="px-2">
                        <Checkbox 
                          checked={selectedOrderIds.includes(order.id)} 
                          onCheckedChange={() => handleToggleOrderSelection(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {order.customerName}
                        {order.archived && (
                          <Badge variant="outline" className="ml-2">
                            <Archive size={12} className="mr-1" /> Arquivado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDateToBR(order.createdAt)}</TableCell>
                      <TableCell>
                        {formatCurrency(order.total)}
                      </TableCell>
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            <FilePenLine size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center">
                <span>Detalhes do Pedido</span>
                {selectedOrder?.archived && (
                  <Badge variant="outline" className="ml-2">
                    <Archive size={12} className="mr-1" /> Arquivado
                  </Badge>
                )}
              </DialogTitle>
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer size={16} /> Imprimir
              </Button>
            </div>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          
          <div ref={printRef} className="p-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Data: {selectedOrder ? formatDateToBR(selectedOrder.createdAt) : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">Dados do Cliente</h3>
                <p><span className="font-semibold">Nome:</span> {selectedCustomer?.name}</p>
                <p><span className="font-semibold">Telefone:</span> {selectedCustomer?.phone}</p>
                <p><span className="font-semibold">CPF/CNPJ:</span> {selectedCustomer?.document}</p>
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
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2 px-4 text-right font-medium">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="font-semibold">Pagamento: {selectedOrder?.paymentStatus}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Subtotal: 
                  {formatCurrency(selectedOrder?.total)}
                </p>
                <p className="font-bold text-lg">Total: 
                  {formatCurrency(selectedOrder?.total)}
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido do cliente {selectedOrder?.customerName}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="mb-6">Imprimir Pedidos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Filtrar por Cliente</label>
              <Select
                value={selectedCustomerId}
                onValueChange={(value) => setSelectedCustomerId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCustomerId === 'all' && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="selectAll" 
                  checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                  onCheckedChange={handleSelectAllOrders}
                />
                <label htmlFor="selectAll" className="text-sm cursor-pointer">
                  Selecionar todos os pedidos
                </label>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-md p-3">
              <p className="font-medium">Serão impressos:</p>
              <p className="text-sm text-gray-600">
                {getOrdersBySelection().length} pedido(s) 
                {selectedCustomerId !== 'all' && ` do cliente ${customers.find(c => c.id === selectedCustomerId)?.name || ""}`}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleBulkPrint} 
              className="bg-sales-800 hover:bg-sales-700"
              disabled={getOrdersBySelection().length === 0}
            >
              <Printer size={16} className="mr-2" /> Imprimir
            </Button>
          </div>
          
          <div className="hidden">
            <div ref={bulkPrintRef} className="p-4">
              {getOrdersBySelection().map((order, orderIndex) => {
                const orderCustomer = customers.find(c => c.id === order.customerId);
                
                const needsPageBreak = (orderIndex + 1) % 2 === 0 && orderIndex < getOrdersBySelection().length - 1;
                
                return (
                  <div key={order.id}>
                    <div className="print-order">
                      <div className="text-center mb-4">
                        <h2 className="font-bold text-lg">PEDIDO #{order.id.substring(0, 8).toUpperCase()}</h2>
                        <p className="text-gray-600">
                          Data: {formatDateToBR(order.createdAt)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className="border rounded-md p-3">
                          <h3 className="font-semibold mb-1">Dados do Cliente</h3>
                          <p><span className="font-semibold">Nome:</span> {orderCustomer?.name}</p>
                          <p><span className="font-semibold">Telefone:</span> {orderCustomer?.phone}</p>
                          <p><span className="font-semibold">CPF/CNPJ:</span> {orderCustomer?.document}</p>
                          <p><span className="font-semibold">Endereço:</span> {orderCustomer?.address}</p>
                          <p>{orderCustomer?.city} - {orderCustomer?.state}, {orderCustomer?.zipCode}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-semibold mb-1">Itens do Pedido</h3>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                              <tr>
                                <th className="py-1 px-2 text-left">Produto</th>
                                <th className="py-1 px-2 text-center">Qtd.</th>
                                <th className="py-1 px-2 text-right">Preço</th>
                                <th className="py-1 px-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="py-1 px-2">{item.productName}</td>
                                  <td className="py-1 px-2 text-center">{item.quantity}</td>
                                  <td className="py-1 px-2 text-right">
                                    {formatCurrency(item.unitPrice)}
                                  </td>
                                  <td className="py-1 px-2 text-right font-medium">
                                    {formatCurrency(item.total)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold">Pagamento: {order.paymentStatus}</p>
                          {order.paymentMethod && (
                            <p className="text-sm">Forma: {order.paymentMethod}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Total: 
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className="mt-2">
                          <h3 className="font-semibold text-sm">Observações:</h3>
                          <p className="text-gray-700 text-sm">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    {needsPageBreak && <div className="print-page-break"></div>}
                  </div>
                );
              })}
              
              <div className="print-footer">
                <p>ForcaVendas - Sistema de Gestão de Vendas</p>
                <p>Para qualquer suporte: (11) 9999-8888</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
