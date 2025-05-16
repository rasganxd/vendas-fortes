import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clipboard, CheckCircle2, Plus, Filter, Search, ArrowDown, ArrowUp } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailDialog from '@/components/orders/OrderDetailDialog';
import DeleteOrderDialog from '@/components/orders/DeleteOrderDialog';
import PrintOrdersDialog from '@/components/orders/PrintOrdersDialog';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useConnection } from '@/context/providers/ConnectionProvider';
import { useCustomers } from '@/hooks/useCustomers';

const Orders = () => {
  const navigate = useNavigate();
  const { orders, deleteOrder, isLoading } = useOrders();
  const { customers } = useCustomers();
  const { connectionStatus } = useConnection();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  console.log("Orders Page: Initial render with", 
    orders?.length, "orders, loading:", isLoading, 
    "connection:", connectionStatus
  );

  // Log when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      console.log("Orders Page: Selected order:", selectedOrder.id);
    }
  }, [selectedOrder]);

  // Handle view order details
  const handleViewOrder = (order: Order) => {
    console.log("Orders Page: Viewing order details:", order.id);
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  // Handle delete order
  const handleDeleteOrder = (order: Order) => {
    console.log("Orders Page: Opening delete dialog for order:", order.id);
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    console.log("Orders Page: Editing order:", order.id);
    navigate(`/pedidos/novo?id=${order.id}`);
  };

  // Handle print orders
  const handlePrintOrders = () => {
    console.log("Orders Page: Opening print dialog for", selectedOrderIds.length, "orders");
    setIsPrintDialogOpen(true);
  };

  // Handle order selection for printing
  const handleToggleOrderSelection = (orderId: string) => {
    console.log("Orders Page: Order selection changed:", orderId);
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  // Handle select/deselect all orders
  const handleSelectAllOrders = () => {
    console.log("Orders Page: Select/deselect all orders");
    if (filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(order => order.id));
    }
  };

  // Handle create new order
  const handleNewOrder = () => {
    console.log("Orders Page: Navigating to new order page");
    navigate('/pedidos/novo');
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    console.log("Orders Page: Sort changed to field:", field);
    setSortDirection(currentDirection => 
      field === sortField ? (currentDirection === 'asc' ? 'desc' : 'asc') : 'asc'
    );
    setSortField(field);
  };

  // Handle copy order code to clipboard
  const handleCopyOrderCode = (code: number) => {
    navigator.clipboard.writeText(code.toString());
    toast.success("Código copiado para a área de transferência");
  };

  // Format currency helper function
  const formatCurrency = (value: number | undefined) => {
    return `R$ ${value?.toFixed(2) || '0.00'}`;
  };

  // Filter orders based on search term and sort
  const filteredOrders = orders
    ? orders.filter(order => {
        const searchFields = [
          order.code?.toString() || '',
          order.customerName || '',
          order.customerId?.toString() || '',
          order.salesRepName || '',
          order.paymentMethod || '',
          order.status || ''
        ];
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA: any, valB: any;
    
    switch (sortField) {
      case 'code':
        valA = a.code || 0;
        valB = b.code || 0;
        break;
      case 'customerName':
        valA = a.customerName || '';
        valB = b.customerName || '';
        break;
      case 'total':
        valA = a.total || 0;
        valB = b.total || 0;
        break;
      case 'createdAt':
        valA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        valB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        break;
      case 'status':
        valA = a.status || '';
        valB = b.status || '';
        break;
      default:
        valA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        valB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    }
    
    const comparison = typeof valA === 'string' 
      ? valA.localeCompare(valB)
      : valA - valB;
      
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  // Log filtered and sorted orders
  console.log(`Orders Page: Displaying ${sortedOrders.length} orders (filtered from ${orders?.length || 0})`);

  return (
    <PageLayout 
      title="Pedidos" 
      subtitle="Gerencie seus pedidos"
    >
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={handleNewOrder} 
          variant="default" 
          className="bg-sales-800 hover:bg-sales-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Pedido
        </Button>
        <Button
          onClick={handlePrintOrders}
          variant="outline"
          disabled={selectedOrderIds.length === 0}
        >
          <Clipboard className="h-4 w-4 mr-2" /> Imprimir
          {selectedOrderIds.length > 0 && (
            <span className="ml-2 bg-sales-100 text-sales-700 rounded-full px-2 py-0.5 text-xs font-medium">
              {selectedOrderIds.length}
            </span>
          )}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center mb-4 gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar pedidos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="flex gap-1 items-center">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
        </div>
      </div>

      <Card className="my-2 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Carregando pedidos...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <OrdersTable 
              filteredOrders={sortedOrders}
              selectedOrderIds={selectedOrderIds}
              handleToggleOrderSelection={handleToggleOrderSelection}
              handleSelectAllOrders={handleSelectAllOrders}
              handleViewOrder={handleViewOrder}
              handleEditOrder={handleEditOrder}
              handleDeleteOrder={handleDeleteOrder}
              formatCurrency={formatCurrency}
            />
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 font-medium text-gray-900">Sem pedidos</h3>
              <p className="mt-1 text-gray-500">
                Nenhum pedido encontrado. Crie seu primeiro pedido para começar.
              </p>
              <div className="mt-6">
                <Button 
                  onClick={handleNewOrder}
                  className="bg-sales-800 hover:bg-sales-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Pedido
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <>
          <OrderDetailDialog 
            selectedOrder={selectedOrder}
            isOpen={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            selectedCustomer={customers?.find(c => c.id === selectedOrder.customerId) || null}
            formatCurrency={formatCurrency}
          />
          
          <DeleteOrderDialog
            selectedOrder={selectedOrder}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirmDelete={() => {
              deleteOrder(selectedOrder.id);
            }}
          />
        </>
      )}
      
      <PrintOrdersDialog 
        isOpen={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        selectedOrderIds={selectedOrderIds}
        orders={orders || []}
        customers={customers}
        filteredOrders={filteredOrders}
        formatCurrency={formatCurrency}
        setSelectedOrderIds={setSelectedOrderIds}
      />
    </PageLayout>
  );
};

export default Orders;
