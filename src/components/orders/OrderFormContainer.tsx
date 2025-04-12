import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Order, OrderItem, Customer, SalesRep, Product } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { usePayments } from '@/hooks/usePayments';
import { toast } from '@/components/ui/use-toast';
import OrderForm from './OrderForm';
import RecentPurchasesDialog from './RecentPurchasesDialog';

export default function OrderFormContainer() {
  const { customers, salesReps, products, orders } = useAppContext();
  const { addOrder, getOrderById, updateOrder } = useOrders();
  const { paymentTables } = usePaymentTables();
  const { createAutomaticPaymentRecord } = usePayments();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentTable, setSelectedPaymentTable] = useState('');
  
  const [customerInputValue, setCustomerInputValue] = useState('');
  const [salesRepInputValue, setSalesRepInputValue] = useState('');
  const [isRecentPurchasesDialogOpen, setIsRecentPurchasesDialogOpen] = useState(false);

  useEffect(() => {
    console.log("Available payment tables:", paymentTables);
  }, [paymentTables]);

  useEffect(() => {
    const orderId = searchParams.get('id');
    
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
          
          // Set the customer input value for display
          const displayValue = customer.code ? `${customer.code} - ${customer.name}` : customer.name;
          setCustomerInputValue(displayValue);
        } else {
          console.warn("Customer not found for ID:", orderToEdit.customerId);
        }
        
        // Find and set sales rep
        const salesRep = salesReps.find(s => s.id === orderToEdit.salesRepId);
        if (salesRep) {
          console.log("Setting sales rep:", salesRep);
          setSelectedSalesRep(salesRep);
          
          // Set the sales rep input value for display
          const displayValue = salesRep.code ? `${salesRep.code} - ${salesRep.name}` : salesRep.name;
          setSalesRepInputValue(displayValue);
        } else {
          console.warn("Sales rep not found for ID:", orderToEdit.salesRepId);
        }
        
        // Set order items
        console.log("Setting order items:", orderToEdit.items);
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
  }, [searchParams, getOrderById, customers, salesReps, orders]);

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedSalesRep(null);
    setOrderItems([]);
    setPaymentMethod('');
    setSelectedPaymentTable('');
    setIsEditMode(false);
    setCurrentOrderId(null);
    setCustomerInputValue('');
    setSalesRepInputValue('');
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
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
      console.log("Starting order submission process...");
      console.log("Current order items:", orderItems);
      
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
      console.log("Order items being saved:", orderItems);
      
      let orderId;
      
      if (isEditMode && currentOrderId) {
        console.log("Updating existing order:", currentOrderId);
        await updateOrder(currentOrderId, orderData);
        orderId = currentOrderId;
        
        toast({
          title: "Pedido Atualizado",
          description: `Pedido #${orderId.substring(0, 6)} atualizado com sucesso.`
        });

        // Create automatic payment record if needed (for promissory notes)
        if (paymentMethod === 'promissoria') {
          await createAutomaticPaymentRecord({
            ...orderData,
            id: orderId
          });
        }
      } else {
        console.log("Creating new order");
        orderId = await addOrder(orderData);
        console.log("Order created with ID:", orderId);
        
        if (orderId) {
          toast({
            title: "Pedido Criado",
            description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
          });
          
          // Create automatic payment record if needed (for promissory notes)
          if (paymentMethod === 'promissoria') {
            await createAutomaticPaymentRecord({
              ...orderData,
              id: orderId
            });
          }
        } else {
          throw new Error("Falha ao criar pedido: ID não retornado");
        }
      }
      
      resetForm();
      
      // Always navigate back to the orders list after successful creation/update
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

  const handleAddItem = (product: Product, quantity: number, price: number) => {
    console.log("Adding item to order:", product, quantity, price);
    
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
      console.log("Updated order items:", updatedItems);
    } else {
      const newItem = {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: quantity,
        unitPrice: price,
        total: price * quantity
      };
      setOrderItems(prevItems => [...prevItems, newItem]);
      console.log("New item added:", newItem);
    }
    
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${product.name} adicionado ao pedido`
    });
  };

  const handleRemoveItem = (productId: string) => {
    console.log("Removing item with productId:", productId);
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    console.log("Order items after removal:", updatedItems);
    setOrderItems(updatedItems);
    
    toast({
      title: "Item removido",
      description: "Item removido do pedido"
    });
  };

  return (
    <>
      <OrderForm 
        customers={customers}
        salesReps={salesReps}
        paymentTables={paymentTables}
        products={products}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedSalesRep={selectedSalesRep}
        setSelectedSalesRep={setSelectedSalesRep}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        selectedPaymentTable={selectedPaymentTable}
        setSelectedPaymentTable={setSelectedPaymentTable}
        isSubmitting={isSubmitting}
        handleCreateOrder={handleCreateOrder}
        isEditMode={isEditMode}
        handleViewRecentPurchases={handleViewRecentPurchases}
        customerInputValue={customerInputValue}
        salesRepInputValue={salesRepInputValue}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
      />

      <RecentPurchasesDialog
        open={isRecentPurchasesDialogOpen}
        onOpenChange={setIsRecentPurchasesDialogOpen}
        customer={selectedCustomer}
        recentOrders={getRecentCustomerOrders()}
      />
    </>
  );
}
