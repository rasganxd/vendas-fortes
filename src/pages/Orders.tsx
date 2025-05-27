import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailDialog from '@/components/orders/OrderDetailDialog';
import DeleteOrderDialog from '@/components/orders/DeleteOrderDialog';
import PrintOrdersDialog from '@/components/orders/PrintOrdersDialog';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useConnection } from '@/context/providers/ConnectionProvider';
import { useCustomers } from '@/hooks/useCustomers';
import OrdersActionButtons from '@/components/orders/OrdersActionButtons';
import OrdersSearchBar from '@/components/orders/OrdersSearchBar';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import MobileOrderImportButton from '@/components/orders/MobileOrderImportButton';

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

  // Log filtered and sorted orders
  console.log(`Orders Page: Displaying ${sortedOrders.length} orders (filtered from ${orders?.length || 0})`);

  // Handle order import completion
  const handleImportComplete = () => {
    console.log("Orders Page: Import completed, refreshing data");
    // The hook already dispatches the ordersUpdated event, so orders will refresh automatically
  };

  return (
    <PageLayout 
      title="Pedidos" 
      subtitle="Gerencie seus pedidos"
    >
      <OrdersActionButtons 
        handleNewOrder={handleNewOrder}
        handlePrintOrders={handlePrintOrders}
        selectedOrderCount={selectedOrderIds.length}
        importButton={<MobileOrderImportButton onImportComplete={handleImportComplete} />}
      />
      
      <OrdersSearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

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
            <EmptyOrdersState handleNewOrder={handleNewOrder} />
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
