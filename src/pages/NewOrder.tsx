
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Save, List, FilePenLine, Trash2, FileText, AlertTriangle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Order, OrderItem, PaymentTable, Product, Customer, SalesRep } from '@/types';

// Import our components
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
            total: (item.unitPrice || price) * ((item.quantity || 0) + quantity)
          } : item
      );
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
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
    return orderItems.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
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
    <PageLayout title="Digitação de Pedidos">
      <div className="bg-white border rounded-md p-6 mb-4">
        <div className="grid grid-cols-12 gap-x-4 gap-y-6">
          {/* Left column - Header information */}
          <div className="col-span-8 grid grid-cols-12 gap-x-4 gap-y-4">
            {/* Sales Rep */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="bg-gray-100 p-2 rounded-full">
                <img 
                  src="/lovable-uploads/1441adec-113e-43a8-998a-fead623a5380.png" 
                  alt="Vendedor" 
                  className="w-6 h-6 opacity-70" 
                />
              </div>
            </div>
            <div className="col-span-11">
              <SalesRepSearchInput
                salesReps={salesReps}
                selectedSalesRep={selectedSalesRep}
                setSelectedSalesRep={setSelectedSalesRep}
              />
            </div>
            
            {/* Customer */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="bg-gray-100 p-2 rounded-full">
                <img 
                  src="/lovable-uploads/1441adec-113e-43a8-998a-fead623a5380.png" 
                  alt="Cliente" 
                  className="w-6 h-6 opacity-70" 
                />
              </div>
            </div>
            <div className="col-span-11">
              <CustomerSearchInput 
                customers={customers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                onViewRecentPurchases={handleViewRecentPurchases}
              />
            </div>
            
            {/* Payment Table */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="bg-gray-100 p-2 rounded-full">
                <img 
                  src="/lovable-uploads/1441adec-113e-43a8-998a-fead623a5380.png" 
                  alt="Tabela" 
                  className="w-6 h-6 opacity-70" 
                />
              </div>
            </div>
            <div className="col-span-11">
              <PaymentOptionsInput
                paymentTables={paymentTables}
                selectedPaymentTable={selectedPaymentTable}
                setSelectedPaymentTable={setSelectedPaymentTable}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                simplifiedView={true}
              />
            </div>
            
            {/* Product entry section */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="bg-gray-100 p-2 rounded-full">
                <img 
                  src="/lovable-uploads/1441adec-113e-43a8-998a-fead623a5380.png" 
                  alt="Produto" 
                  className="w-6 h-6 opacity-70" 
                />
              </div>
            </div>
            <div className="col-span-11">
              <ProductSearchInput
                products={products}
                addItemToOrder={handleAddItem}
                inlineLayout={true}
              />
            </div>
          </div>
          
          {/* Right column - Action buttons */}
          <div className="col-span-4 grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start">
              <List size={16} /> Listar <span className="ml-auto text-xs text-gray-400">F3</span>
            </Button>
            <Button variant="outline" className="justify-start">
              <FilePenLine size={16} /> Alterar <span className="ml-auto text-xs text-gray-400">F4</span>
            </Button>
            <Button variant="outline" className="justify-start">
              <Trash2 size={16} /> Eliminar <span className="ml-auto text-xs text-gray-400">F5</span>
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText size={16} /> Emissão NF <span className="ml-auto text-xs text-gray-400">F6</span>
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle size={16} /> Negativa <span className="ml-auto text-xs text-gray-400">F7</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={handleViewRecentPurchases}
            >
              <FileText size={16} /> Últimas Compras
            </Button>
            <Button 
              onClick={handleCreateOrder} 
              disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
              className="col-span-2 bg-sales-800 hover:bg-sales-700 text-white"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Salvando...' : 'Finalizar Pedido'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Items Table Card */}
      <Card>
        <CardContent className="p-0">
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
