
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Order, OrderItem, Customer, SalesRep, Product } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { usePayments } from '@/hooks/usePayments';
import { toast } from '@/components/ui/use-toast';
import OrderForm from './OrderForm';
import RecentPurchasesDialog from './RecentPurchasesDialog';
import { v4 as uuidv4 } from 'uuid';

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
  
  const [selectedPaymentTable, setSelectedPaymentTable] = useState('default-table');
  
  const [customerInputValue, setCustomerInputValue] = useState('');
  const [salesRepInputValue, setSalesRepInputValue] = useState('');
  const [isRecentPurchasesDialogOpen, setIsRecentPurchasesDialogOpen] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);

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
        setOriginalOrder(orderToEdit); // Store the original order
        
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
        
        // Set order items, normalizing properties for consistency and ensuring IDs are preserved
        console.log("Setting order items:", orderToEdit.items);
        
        // IMPROVED: Better item normalization to preserve IDs and ensure data consistency
        if (orderToEdit.items && Array.isArray(orderToEdit.items)) {
          const updatedItems: OrderItem[] = orderToEdit.items.map(item => ({
            id: item.id || uuidv4(),  // Ensure every item has an ID
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode || 0,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.price || 0,
            price: item.price || item.unitPrice || 0,
            discount: item.discount || 0,
            total: (item.unitPrice || item.price || 0) * item.quantity
          }));
          setOrderItems(updatedItems);
          console.log("Normalized order items with preserved IDs:", updatedItems);
        } else {
          console.warn("Order items are missing or not in expected format");
          setOrderItems([]);
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
    setSelectedPaymentTable('default-table');
    setIsEditMode(false);
    setCurrentOrderId(null);
    setCustomerInputValue('');
    setSalesRepInputValue('');
    setOriginalOrder(null);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
  };

  const handleAddItem = (product: Product, quantity: number, price: number) => {
    console.log("Adding item to order:", product, quantity, price);
    
    // Check if product already exists in order
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      console.log("Updating existing item:", existingItem);
      const updatedItems = orderItems.map(item =>
        item.productId === product.id ? 
          { 
            ...item, 
            quantity: (item.quantity || 0) + quantity,
            unitPrice: price,  // Update the unit price to the new one
            price: price,      // Ensure price field is also set for consistency
            total: price * ((item.quantity || 0) + quantity)
          } : item
      );
      setOrderItems(updatedItems);
      console.log("Updated order items:", updatedItems);
    } else {
      // IMPROVED: Create new item with unique identifier
      const newItem: OrderItem = {
        id: uuidv4(), // Generate a unique ID for each new item
        productId: product.id,
        productName: product.name,
        productCode: product.code || 0,
        quantity: quantity,
        price: price,
        unitPrice: price,
        discount: 0,
        total: price * quantity
      };
      
      console.log("Adding new item with generated ID:", newItem);
      setOrderItems(prevItems => [...prevItems, newItem]);
    }
    
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${product.name} adicionado ao pedido`
    });
  };

  const handleRemoveItem = (productId: string) => {
    console.log("Removing item with productId:", productId);
    setOrderItems(items => items.filter(item => item.productId !== productId));
    console.log("Items after removal:", orderItems.filter(item => item.productId !== productId));
    
    toast({
      title: "Item removido",
      description: "Item removido do pedido"
    });
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
      
      // Ensure all order items have consistent fields and preserved IDs before submission
      const normalizedItems = orderItems.map(item => ({
        id: item.id || uuidv4(), // Ensure every item has an ID
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode || 0,
        quantity: item.quantity,
        unitPrice: item.unitPrice || item.price || 0,
        price: item.price || item.unitPrice || 0,
        discount: item.discount || 0,
        total: (item.unitPrice || item.price || 0) * item.quantity
      }));
      
      console.log("Normalized order items for submission with preserved IDs:", normalizedItems);
      
      // Get the selected payment table
      const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
      
      const orderData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        salesRepId: selectedSalesRep!.id,
        salesRepName: selectedSalesRep!.name,
        items: normalizedItems,
        total: calculateTotal(),
        paymentStatus: "pending" as Order["paymentStatus"],
        paymentMethod: selectedTable?.name || "Padrão", // Use payment table name as payment method
        paymentTableId: selectedPaymentTable,
        code: isEditMode && originalOrder ? originalOrder.code : Math.floor(Math.random() * 10000), // Keep original code if editing
        date: isEditMode && originalOrder ? originalOrder.date : new Date(),
        dueDate: isEditMode && originalOrder ? originalOrder.dueDate : new Date(),
        discount: 0,
        payments: isEditMode && originalOrder ? originalOrder.payments : [],
        notes: isEditMode && originalOrder ? originalOrder.notes : "",
        createdAt: isEditMode && originalOrder ? originalOrder.createdAt : new Date(),
        updatedAt: new Date(),
        status: isEditMode && originalOrder ? originalOrder.status : "draft" as Order["status"],
      };
      
      console.log("Saving order with data:", orderData);
      
      let orderId;
      
      if (isEditMode && currentOrderId) {
        console.log("Updating existing order:", currentOrderId);
        // IMPROVED: Pass a clear reference to items array to ensure correct handling
        await updateOrder(currentOrderId, {
          ...orderData,
          items: normalizedItems // Ensure we're passing the normalized items with IDs
        });
        orderId = currentOrderId;
        
        toast({
          title: "Pedido Atualizado",
          description: `Pedido #${orderId.substring(0, 6)} atualizado com sucesso.`
        });

        // Create automatic payment record if needed (for promissory note tables)
        const isPromissoryNote = selectedTable?.name?.toLowerCase().includes('promissoria');
        if (isPromissoryNote) {
          await createAutomaticPaymentRecord({
            ...orderData,
            id: orderId,
            code: orderData.code || 0 // Ensure code is not undefined
          } as Order);
        }
      } else {
        console.log("Creating new order");
        orderId = await addOrder(orderData as Omit<Order, "id">);
        console.log("Order created with ID:", orderId);
        
        if (orderId) {
          toast({
            title: "Pedido Criado",
            description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
          });
          
          // Create automatic payment record if needed (for promissory note tables)
          const isPromissoryNote = selectedTable?.name?.toLowerCase().includes('promissoria');
          if (isPromissoryNote) {
            await createAutomaticPaymentRecord({
              ...orderData,
              id: orderId,
              code: orderData.code || 0 // Ensure code is not undefined
            } as Order);
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
