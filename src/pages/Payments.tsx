import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Printer, Archive } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Order, Customer } from '@/types';

// Import the extracted components
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailDialog from '@/components/orders/OrderDetailDialog';
import PrintOrdersDialog from '@/components/orders/PrintOrdersDialog';
import DeleteOrderDialog from '@/components/orders/DeleteOrderDialog';

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
          
          <OrdersTable 
            filteredOrders={filteredOrders}
            selectedOrderIds={selectedOrderIds}
            handleToggleOrderSelection={handleToggleOrderSelection}
            handleSelectAllOrders={handleSelectAllOrders}
            handleViewOrder={handleViewOrder}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      <OrderDetailDialog 
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        selectedOrder={selectedOrder}
        selectedCustomer={selectedCustomer}
        formatCurrency={formatCurrency}
      />
      
      <DeleteOrderDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedOrder={selectedOrder}
        onConfirmDelete={confirmDeleteOrder}
      />
      
      <PrintOrdersDialog 
        isOpen={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        orders={orders}
        customers={customers}
        selectedOrderIds={selectedOrderIds}
        setSelectedOrderIds={setSelectedOrderIds}
        filteredOrders={filteredOrders}
        formatCurrency={formatCurrency}
      />
    </PageLayout>
  );
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
