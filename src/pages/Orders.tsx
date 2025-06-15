import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Order } from '@/types';
import { DatePeriod } from '@/types/dateFilter';
import { Card, CardContent } from '@/components/ui/card';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailDialog from '@/components/orders/OrderDetailDialog';
import DeleteOrderDialog from '@/components/orders/DeleteOrderDialog';
import PrintOrdersDialog from '@/components/orders/PrintOrdersDialog';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useConnection } from '@/context/providers/ConnectionProvider';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrdersDateFilter } from '@/hooks/useOrdersDateFilter';
import OrdersActionButtons from '@/components/orders/OrdersActionButtons';
import OrdersSearchBar from '@/components/orders/OrdersSearchBar';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';

const Orders = () => {
  const navigate = useNavigate();
  const { orders, deleteOrder, isLoading } = useOrders();
  const { customers } = useCustomers();
  const { connectionStatus } = useConnection();
  const { periodCounts, filterOrdersByPeriod } = useOrdersDateFilter(orders || []);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  console.log("Orders Page: Initial render with", 
    orders?.length, "orders, loading:", isLoading, 
    "connection:", connectionStatus,
    "selected period:", selectedPeriod
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
    if (sortedOrders.length > 0 && selectedOrderIds.length === sortedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(sortedOrders.map(order => order.id));
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

  // Handle confirm delete with proper cleanup
  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;
    
    try {
      console.log("Orders Page: Confirming deletion of order:", selectedOrder.id);
      await deleteOrder(selectedOrder.id);
      
      // Close dialog and clear selected order after successful deletion
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      
      console.log("Orders Page: Order deletion completed successfully");
    } catch (error) {
      console.error("Orders Page: Error during order deletion:", error);
      // Error is already handled in useOrdersOperations with toast
    }
  };

  // Filter orders based on search term, period, and sort
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
        
        const matchesSearch = searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return matchesSearch;
      })
    : [];

  // Apply period filter
  const periodFilteredOrders = filterOrdersByPeriod(filteredOrders, selectedPeriod);

  // Sort orders
  const sortedOrders = [...periodFilteredOrders].sort((a, b) => {
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
  console.log(`Orders Page: Displaying ${sortedOrders.length} orders (filtered from ${orders?.length || 0}), period: ${selectedPeriod}`);

  return (
    <PageLayout 
      title="Pedidos" 
      subtitle="Gerencie seus pedidos"
    >
      <OrdersActionButtons 
        handleNewOrder={() => navigate('/pedidos/novo')}
        handlePrintOrders={() => setIsPrintDialogOpen(true)}
        selectedOrderCount={selectedOrderIds.length}
      />
      
      <OrdersSearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        periodCounts={periodCounts}
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
              handleToggleOrderSelection={(orderId) => {
                setSelectedOrderIds(prev => 
                  prev.includes(orderId) 
                    ? prev.filter(id => id !== orderId) 
                    : [...prev, orderId]
                );
              }}
              handleSelectAllOrders={() => {
                if (sortedOrders.length > 0 && selectedOrderIds.length === sortedOrders.length) {
                  setSelectedOrderIds([]);
                } else {
                  setSelectedOrderIds(sortedOrders.map(order => order.id));
                }
              }}
              handleViewOrder={(order) => {
                setSelectedOrder(order);
                setIsDetailDialogOpen(true);
              }}
              handleEditOrder={(order) => navigate(`/pedidos/novo?id=${order.id}`)}
              handleDeleteOrder={(order) => {
                setSelectedOrder(order);
                setIsDeleteDialogOpen(true);
              }}
              formatCurrency={(value) => `R$ ${value?.toFixed(2) || '0.00'}`}
            />
          ) : (
            <EmptyOrdersState handleNewOrder={() => navigate('/pedidos/novo')} />
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
            formatCurrency={(value) => `R$ ${value?.toFixed(2) || '0.00'}`}
          />
          
          <DeleteOrderDialog
            selectedOrder={selectedOrder}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirmDelete={handleConfirmDelete}
          />
        </>
      )}
      
      <PrintOrdersDialog 
        isOpen={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        selectedOrderIds={selectedOrderIds}
        orders={orders || []}
        customers={customers}
        filteredOrders={periodFilteredOrders}
        formatCurrency={(value) => `R$ ${value?.toFixed(2) || '0.00'}`}
        setSelectedOrderIds={setSelectedOrderIds}
      />
    </PageLayout>
  );
};

export default Orders;
