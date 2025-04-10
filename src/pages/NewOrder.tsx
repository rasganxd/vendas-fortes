import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Save, FileText } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderItem, Product, Customer, SalesRep } from '@/types';

import CustomerSearchInput from '@/components/orders/CustomerSearchInput';
import SalesRepSearchInput from '@/components/orders/SalesRepSearchInput';
import ProductSearchInput from '@/components/orders/ProductSearchInput';
import PaymentOptionsInput from '@/components/orders/PaymentOptionsInput';
import OrderItemsTable from '@/components/orders/OrderItemsTable';
import RecentPurchasesDialog from '@/components/orders/RecentPurchasesDialog';

export default function NewOrder() {
  const { customers, salesReps, products, orders } = useAppContext();
  const { addOrder, getOrderById, updateOrder } = useOrders();
  const { paymentTables } = usePaymentTables();
  const navigate = useNavigate();
  const location = useLocation();
  
  const salesRepInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const paymentTableRef = useRef<HTMLButtonElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentTable, setSelectedPaymentTable] = useState('');

  const [isRecentPurchasesDialogOpen, setIsRecentPurchasesDialogOpen] = useState(false);

  useEffect(() => {
    console.log("Available payment tables:", paymentTables);
  }, [paymentTables]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('id');
    
    if (orderId) {
      console.log("Getting order with ID:", orderId);
      const orderToEdit = getOrderById(orderId);
      
      if (orderToEdit) {
        console.log("Loading order for editing:", orderToEdit);
        setIsEditMode(true);
        setCurrentOrderId(orderId);
        
        // Find and set customer
        const customer = customers.find(c => c.id === orderToEdit.customerId);
        if (customer) {
          console.log("Setting customer:", customer);
          setSelectedCustomer(customer);
        } else {
          console.warn("Customer not found for ID:", orderToEdit.customerId);
        }
        
        // Find and set sales rep
        const salesRep = salesReps.find(s => s.id === orderToEdit.salesRepId);
        if (salesRep) {
          console.log("Setting sales rep:", salesRep);
          setSelectedSalesRep(salesRep);
        } else {
          console.warn("Sales rep not found for ID:", orderToEdit.salesRepId);
        }
        
        // Set order items
        setOrderItems(orderToEdit.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode || 0,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity
        })));
        
        // Set payment method
        if (orderToEdit.paymentMethod) {
          setPaymentMethod(orderToEdit.paymentMethod);
        }
        
        // Set payment table
        if (orderToEdit.paymentTableId) {
          setSelectedPaymentTable(orderToEdit.paymentTableId);
        }
        
        toast({
          title: "Pedido carregado",
          description: `Editando pedido ${orderId.substring(0, 6)}`
        });
      } else {
        console.error("Order not found for ID:", orderId);
        toast({
          title: "Pedido não encontrado",
          description: "O pedido solicitado não foi encontrado.",
          variant: "destructive"
        });
      }
    }
  }, [location.search, getOrderById, customers, salesReps, orders]);

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
        productCode: product.code,
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
    setIsEditMode(false);
    setCurrentOrderId(null);
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
      
      // Get the selected payment table
      const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
      
      const orderData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        salesRepId: selectedSalesRep.id,
        salesRepName: selectedSalesRep.name,
        items: orderItems,
        total: calculateTotal(),
        paymentStatus: "pending" as Order["paymentStatus"],
        paymentMethod: paymentMethod || "",
        paymentTableId: selectedPaymentTable || undefined,
        createdAt: new Date(),
        status: "draft" as Order["status"],
      };
      
      console.log("Saving order with data:", orderData);
      
      let orderId;
      
      if (isEditMode && currentOrderId) {
        await updateOrder(currentOrderId, orderData);
        orderId = currentOrderId;
        
        toast({
          title: "Pedido Atualizado",
          description: `Pedido #${orderId.substring(0, 6)} atualizado com sucesso.`
        });
      } else {
        orderId = await addOrder(orderData);
        
        if (orderId) {
          toast({
            title: "Pedido Criado",
            description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
          });
        }
      }
      
      resetForm();
      
      setTimeout(() => {
        navigate('/pedidos');
      }, 1500);
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
      toast({
        title: isEditMode ? "Erro ao atualizar pedido" : "Erro ao criar pedido",
        description: "Ocorreu um erro ao processar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecentCustomerOrders = () => {
    if (!selectedCustomer) return [];
    
    return orders
      .filter(order => order.customerId === selectedCustomer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
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
    <PageLayout title={isEditMode ? "Edição de Pedido" : "Digitação de Pedidos"}>
      <div className="bg-white border rounded-md p-6 mb-4">
        <div className="grid grid-cols-12 gap-x-4 gap-y-6">
          <div className="col-span-8 grid grid-cols-1 gap-y-4">
            <div>
              <SalesRepSearchInput
                salesReps={salesReps}
                selectedSalesRep={selectedSalesRep}
                setSelectedSalesRep={setSelectedSalesRep}
                inputRef={salesRepInputRef}
                onEnterPress={() => customerInputRef.current?.focus()}
                compact={true}
              />
            </div>
            
            <div>
              <CustomerSearchInput 
                customers={customers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                onViewRecentPurchases={handleViewRecentPurchases}
                inputRef={customerInputRef}
                onEnterPress={() => paymentTableRef.current?.focus()}
                compact={true}
              />
            </div>
            
            <div>
              <PaymentOptionsInput
                paymentTables={paymentTables}
                selectedPaymentTable={selectedPaymentTable}
                setSelectedPaymentTable={setSelectedPaymentTable}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                simplifiedView={true}
                buttonRef={paymentTableRef}
                onSelectComplete={() => productInputRef.current?.focus()}
                customerId={selectedCustomer?.id}
                customerName={selectedCustomer?.name}
                orderTotal={calculateTotal()}
              />
            </div>
            
            <div>
              <ProductSearchInput
                products={products}
                addItemToOrder={handleAddItem}
                inlineLayout={true}
                inputRef={productInputRef}
              />
            </div>
          </div>
          
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="justify-start mb-2"
              onClick={handleViewRecentPurchases}
            >
              <FileText size={16} className="mr-2" /> Últimas Compras
            </Button>
            <Button 
              onClick={handleCreateOrder} 
              disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
              className="w-full bg-sales-800 hover:bg-sales-700 text-white"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Pedido' : 'Finalizar Pedido'}
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <OrderItemsTable 
            orderItems={orderItems}
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
