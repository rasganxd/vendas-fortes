import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Order, OrderItem, Customer, SalesRep, Product } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { usePayments } from '@/hooks/usePayments';
import { toast } from '@/hooks/use-toast';
import OrderForm from './OrderForm';
import RecentPurchasesDialog from './RecentPurchasesDialog';
import { v4 as uuidv4 } from 'uuid';

export default function OrderFormContainer() {
  const { customers, salesReps, products, orders, connectionStatus } = useAppContext();
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Available payment tables:", paymentTables);
  }, [paymentTables]);

  useEffect(() => {
    console.log("Current connection status:", connectionStatus);
  }, [connectionStatus]);

  // Improved load order function with better error handling and validation
  useEffect(() => {
    const loadOrder = async (orderId: string) => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log("Loading order for editing:", orderId);
        
        if (!orderId) {
          throw new Error("ID do pedido não fornecido");
        }
        
        const orderToEdit = await getOrderById(orderId);
        console.log("Order data received:", orderToEdit);
        
        if (!orderToEdit) {
          throw new Error("Pedido não encontrado");
        }
        
        console.log("Order loaded successfully:", orderToEdit);
        setIsEditMode(true);
        setCurrentOrderId(orderId);
        setOriginalOrder(orderToEdit);
        
        // Find and set customer with error handling
        const customer = customers.find(c => c.id === orderToEdit.customerId);
        if (customer) {
          console.log("Setting customer:", customer.name);
          setSelectedCustomer(customer);
          
          // Set the customer input value for display
          const displayValue = customer.code ? `${customer.code} - ${customer.name}` : customer.name;
          setCustomerInputValue(displayValue);
        } else {
          console.warn("Customer not found for ID:", orderToEdit.customerId);
          toast({
            title: "Cliente não encontrado",
            description: "O cliente associado a este pedido não foi encontrado."
          });
        }
        
        // Find and set sales rep with error handling
        const salesRep = salesReps.find(s => s.id === orderToEdit.salesRepId);
        if (salesRep) {
          console.log("Setting sales rep:", salesRep.name);
          setSelectedSalesRep(salesRep);
          
          // Set the sales rep input value for display
          const displayValue = salesRep.code ? `${salesRep.code} - ${salesRep.name}` : salesRep.name;
          setSalesRepInputValue(displayValue);
        } else {
          console.warn("Sales rep not found for ID:", orderToEdit.salesRepId);
          toast({
            title: "Vendedor não encontrado",
            description: "O vendedor associado a este pedido não foi encontrado."
          });
        }
        
        // Enhanced validation and processing of order items
        if (orderToEdit.items && Array.isArray(orderToEdit.items)) {
          console.log("Processing order items:", orderToEdit.items.length);
          
          if (orderToEdit.items.length === 0) {
            console.warn("Order has no items");
          }
          
          // Improved item normalization with more thorough validation
          const updatedItems: OrderItem[] = orderToEdit.items.map((item, index) => {
            if (!item) {
              console.warn(`Null or undefined item found at index ${index}`);
              // Create a placeholder item to prevent crashes
              return {
                id: uuidv4(),
                productId: `unknown-${index}`,
                productName: "Item desconhecido",
                productCode: 0,
                quantity: 1,
                unitPrice: 0,
                price: 0,
                discount: 0,
                total: 0
              };
            }
            
            return {
              id: item.id || uuidv4(),
              productId: item.productId || `unknown-${index}`,
              productName: item.productName || "Item sem nome",
              productCode: item.productCode || 0,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || item.price || 0,
              price: item.price || item.unitPrice || 0,
              discount: item.discount || 0,
              total: ((item.unitPrice || item.price || 0) * (item.quantity || 1))
            };
          });
          
          console.log("Normalized order items:", updatedItems);
          setOrderItems(updatedItems);
        } else {
          console.warn("Order items are missing or not in expected format", orderToEdit.items);
          setOrderItems([]);
          toast({
            title: "Erro nos itens",
            description: "Os itens deste pedido não puderam ser carregados corretamente."
          });
        }
        
        // Set payment table with validation
        if (orderToEdit.paymentTableId) {
          console.log("Setting payment table ID:", orderToEdit.paymentTableId);
          const tableExists = paymentTables.some(pt => pt.id === orderToEdit.paymentTableId);
          
          if (tableExists) {
            setSelectedPaymentTable(orderToEdit.paymentTableId);
          } else {
            console.warn("Payment table not found:", orderToEdit.paymentTableId);
            // Fall back to default table
            setSelectedPaymentTable(paymentTables.length > 0 ? paymentTables[0].id : 'default-table');
          }
        }
        
        toast({
          title: "Pedido carregado",
          description: `Editando pedido ${orderId.substring(0, 6)}`
        });
      } catch (error) {
        console.error("Error loading order:", error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        setLoadError(errorMsg);
        
        toast({
          variant: "destructive",
          title: "Erro ao carregar pedido",
          description: `Ocorreu um erro ao carregar o pedido: ${errorMsg}`
        });
        
        // Navigation with delay
        setTimeout(() => {
          navigate('/pedidos');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    const orderId = searchParams.get('id');
    if (orderId) {
      loadOrder(orderId);
    }
  }, [searchParams, getOrderById, customers, salesReps, paymentTables, navigate]);

  // Reset form function
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

  // Add item function
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
    
    toast("Item adicionado", {
      description: `${quantity}x ${product.name} adicionado ao pedido`
    });
  };

  // Remove item function
  const handleRemoveItem = (productId: string) => {
    console.log("Removing item with productId:", productId);
    setOrderItems(items => items.filter(item => item.productId !== productId));
    console.log("Items after removal:", orderItems.filter(item => item.productId !== productId));
    
    toast("Item removido", {
      description: "Item removido do pedido"
    });
  };

  // Order creation/update function with improved error handling
  const handleCreateOrder = async () => {
    // Form validation
    if (!selectedCustomer) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um cliente para o pedido."
      });
      return;
    }
    
    if (!selectedSalesRep) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um vendedor para o pedido."
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Adicione pelo menos um item ao pedido."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Starting order submission process...");
      console.log("Current connection status:", connectionStatus);
      
      // Normalize order items with improved validation
      const normalizedItems = orderItems.map(item => ({
        id: item.id || uuidv4(),
        productId: item.productId || '',
        productName: item.productName || 'Produto sem nome',
        productCode: item.productCode || 0,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.price || 0,
        price: item.price || item.unitPrice || 0,
        discount: item.discount || 0,
        total: (item.unitPrice || item.price || 0) * (item.quantity || 1)
      }));
      
      // Calculate total based on the normalized items
      const calculatedTotal = normalizedItems.reduce((sum, item) => 
        sum + ((item.quantity || 1) * (item.unitPrice || item.price || 0)), 0);
      
      // Get the selected payment table
      const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
      
      // Prepare order data with consistent values
      const orderData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        salesRepId: selectedSalesRep.id,
        salesRepName: selectedSalesRep.name,
        items: normalizedItems,
        total: calculatedTotal,
        paymentStatus: isEditMode && originalOrder?.paymentStatus ? originalOrder.paymentStatus : "pending" as Order["paymentStatus"],
        paymentMethod: selectedTable?.name || "Padrão",
        paymentMethodId: isEditMode && originalOrder?.paymentMethodId ? originalOrder.paymentMethodId : "",
        paymentTableId: selectedPaymentTable,
        code: isEditMode && originalOrder?.code ? originalOrder.code : Math.floor(Math.random() * 10000),
        date: isEditMode && originalOrder?.date ? originalOrder.date : new Date(),
        dueDate: isEditMode && originalOrder?.dueDate ? originalOrder.dueDate : new Date(),
        discount: isEditMode && originalOrder?.discount ? originalOrder.discount : 0,
        payments: isEditMode && originalOrder?.payments ? [...originalOrder.payments] : [],
        notes: isEditMode && originalOrder?.notes ? originalOrder.notes : "",
        createdAt: isEditMode && originalOrder?.createdAt ? originalOrder.createdAt : new Date(),
        updatedAt: new Date(),
        status: isEditMode && originalOrder?.status ? originalOrder.status : "draft" as Order["status"],
        deliveryAddress: isEditMode && originalOrder?.deliveryAddress ? originalOrder.deliveryAddress : "",
        deliveryCity: isEditMode && originalOrder?.deliveryCity ? originalOrder.deliveryCity : "",
        deliveryState: isEditMode && originalOrder?.deliveryState ? originalOrder.deliveryState : "",
        deliveryZip: isEditMode && originalOrder?.deliveryZip ? originalOrder.deliveryZip : "",
        archived: isEditMode && originalOrder?.archived ? originalOrder.archived : false,
      };
      
      console.log("Saving order with data:", orderData);
      
      let orderId = "";
      
      if (isEditMode && currentOrderId) {
        console.log("Updating existing order:", currentOrderId);
        // Ensure we're passing the normalized items with IDs
        await updateOrder(currentOrderId, {
          ...orderData,
          items: normalizedItems
        });
        
        orderId = currentOrderId;
        toast({
          title: "Pedido Atualizado",
          description: `Pedido #${orderId.substring(0, 6)} atualizado com sucesso.`
        });

        // Create automatic payment record if needed
        const isPromissoryNote = selectedTable?.type === 'promissoria';
        if (isPromissoryNote && orderId) {
          console.log("Creating automatic payment record for promissory note");
          await createAutomaticPaymentRecord({
            ...orderData,
            id: orderId,
            code: orderData.code || 0
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
          
          // Create automatic payment record if needed
          const isPromissoryNote = selectedTable?.type === 'promissoria';
          if (isPromissoryNote) {
            console.log("Creating automatic payment record for promissory note");
            await createAutomaticPaymentRecord({
              ...orderData,
              id: orderId,
              code: orderData.code || 0
            } as Order);
          }
        } else {
          throw new Error("Falha ao criar pedido: ID não retornado");
        }
      }
      
      resetForm();
      
      // Navigate back to orders list
      setTimeout(() => {
        navigate('/pedidos');
      }, 1500);
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
      toast({
        variant: "destructive",
        title: isEditMode ? "Erro ao atualizar pedido" : "Erro ao criar pedido",
        description: `Ocorreu um erro ao processar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get recent customer orders
  const getRecentCustomerOrders = () => {
    if (!selectedCustomer) return [];
    
    return orders
      .filter(order => order.customerId === selectedCustomer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  // View recent purchases
  const handleViewRecentPurchases = () => {
    if (selectedCustomer) {
      setIsRecentPurchasesDialogOpen(true);
    } else {
      toast("Atenção", {
        description: "Selecione um cliente primeiro para ver compras recentes."
      });
    }
  };

  // Show loading state or error message if applicable
  if (loadError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-2 border-red-500 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-lg text-gray-700 mb-2">Erro ao carregar pedido</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <button 
            onClick={() => navigate('/pedidos')} 
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Voltar para lista de pedidos
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Carregando pedido...</p>
        </div>
      </div>
    );
  }

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
        connectionStatus={connectionStatus}
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
