
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ShoppingCart } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Order, OrderItem, PaymentTable, Product, Customer, SalesRep } from '@/types';

// Import our new components
import CustomerSearchInput from '@/components/orders/CustomerSearchInput';
import SalesRepSearchInput from '@/components/orders/SalesRepSearchInput';
import ProductSearchInput from '@/components/orders/ProductSearchInput';
import PaymentOptionsInput from '@/components/orders/PaymentOptionsInput';
import OrderItemsTable from '@/components/orders/OrderItemsTable';
import RecentPurchasesDialog from '@/components/orders/RecentPurchasesDialog';

export default function NewOrder() {
  const { customers, salesReps, products, orders } = useAppContext();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [orderItems, setOrderItems] = useState<Partial<OrderItem>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment related states
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentTable, setSelectedPaymentTable] = useState('');
  
  // Mock payment tables for now (later to be replaced by context data)
  const [paymentTables] = useState<PaymentTable[]>([
    {
      id: '1',
      name: 'Pagamento à Vista',
      description: 'Pagamento integral no momento da compra',
      active: true,
      createdAt: new Date(),
      terms: [
        { id: '1-1', days: 0, percentage: 100, description: 'À vista' }
      ]
    },
    {
      id: '2',
      name: 'Pagamento 30/60/90',
      description: 'Pagamento parcelado em 3 vezes',
      active: true,
      createdAt: new Date(),
      terms: [
        { id: '2-1', days: 30, percentage: 33.33, description: '1ª parcela' },
        { id: '2-2', days: 60, percentage: 33.33, description: '2ª parcela' },
        { id: '2-3', days: 90, percentage: 33.34, description: '3ª parcela' }
      ]
    }
  ]);
  
  // Recent purchases dialog state
  const [isRecentPurchasesDialogOpen, setIsRecentPurchasesDialogOpen] = useState(false);

  const handleAddItem = (product: Product, quantity: number, price: number) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      const updatedItems = orderItems.map(item =>
        item.productId === product.id ? 
          { 
            ...item, 
            quantity: (item.quantity || 0) + quantity,
            total: (item.price || price) * ((item.quantity || 0) + quantity)
          } : item
      );
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: price,
        unitPrice: price,
        total: price * quantity
      }]);
    }
    
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${product.name} adicionado ao pedido`
    });
  };

  const handleRemoveItem = (productId: string) => {
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    setOrderItems(updatedItems);
    toast({
      title: "Item removido",
      description: "Item removido do pedido"
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedSalesRep(null);
    setOrderItems([]);
    setPaymentMethod('');
    setSelectedPaymentTable('');
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSalesRep) {
      toast({
        title: "Erro",
        description: "Selecione um vendedor para o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const orderData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        salesRepId: selectedSalesRep.id,
        salesRepName: selectedSalesRep.name,
        items: orderItems as OrderItem[],
        total: calculateTotal(),
        status: "draft" as Order["status"],
        paymentStatus: "pending" as Order["paymentStatus"],
        paymentMethod: paymentMethod || undefined,
        paymentTableId: selectedPaymentTable || undefined,
        createdAt: new Date(),
        deliveryAddress: selectedCustomer.address,
        deliveryCity: selectedCustomer.city,
        deliveryState: selectedCustomer.state,
        deliveryZipCode: selectedCustomer.zipCode
      };
      
      const orderId = await addOrder(orderData);
      
      if (orderId) {
        toast({
          title: "Pedido Criado",
          description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
        });
        
        resetForm();
        
        setTimeout(() => {
          navigate('/pedidos');
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao criar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get recent orders for a customer
  const getRecentCustomerOrders = () => {
    if (!selectedCustomer) return [];
    
    return orders
      .filter(order => order.customerId === selectedCustomer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Get the 10 most recent orders
  };

  const handleViewRecentPurchases = () => {
    if (selectedCustomer) {
      setIsRecentPurchasesDialogOpen(true);
    } else {
      toast({
        title: "Atenção",
        description: "Selecione um cliente primeiro para ver compras recentes.",
      });
    }
  };

  return (
    <PageLayout title="Novo Pedido">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} /> Informações do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSearchInput 
              customers={customers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              onViewRecentPurchases={handleViewRecentPurchases}
            />
            
            <SalesRepSearchInput
              salesReps={salesReps}
              selectedSalesRep={selectedSalesRep}
              setSelectedSalesRep={setSelectedSalesRep}
            />
            
            <PaymentOptionsInput
              paymentTables={paymentTables}
              selectedPaymentTable={selectedPaymentTable}
              setSelectedPaymentTable={setSelectedPaymentTable}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearchInput
              products={products}
              addItemToOrder={handleAddItem}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>{calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                <span>Itens:</span>
                <span>{orderItems.length}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateOrder} 
              disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
              className="w-full bg-sales-800 hover:bg-sales-700 mb-4"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Salvando...' : 'Finalizar Pedido'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderItemsTable 
            orderItems={orderItems as OrderItem[]}
            onRemoveItem={handleRemoveItem}
            calculateTotal={calculateTotal}
          />
        </CardContent>
      </Card>

      <RecentPurchasesDialog
        open={isRecentPurchasesDialogOpen}
        onOpenChange={setIsRecentPurchasesDialogOpen}
        customer={selectedCustomer}
        recentOrders={getRecentCustomerOrders()}
      />
    </PageLayout>
  );
}
