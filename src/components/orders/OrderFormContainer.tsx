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

interface OrderFormContainerProps {
  preloadedOrder?: Order | null;
  orderId?: string | null;
}

export default function OrderFormContainer({ preloadedOrder, orderId }: OrderFormContainerProps) {
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

  // Enhanced load order function with improved data handling
  useEffect(() => {
    const loadOrder = async (orderToLoad: string) => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log("🔄 Loading order for editing:", orderToLoad);
        
        if (!orderToLoad) {
          throw new Error("ID do pedido não fornecido");
        }
        
        let orderToEdit: Order | null = null;
        
        if (preloadedOrder && preloadedOrder.id === orderToLoad) {
          console.log("✅ Using preloaded order data:", preloadedOrder.id);
          orderToEdit = preloadedOrder;
        } else {
          console.log("🔍 Fetching order data from service:", orderToLoad);
          orderToEdit = await getOrderById(orderToLoad);
        }
        
        if (!orderToEdit) {
          throw new Error("Pedido não encontrado");
        }
        
        console.log("📋 Order loaded successfully:", orderToEdit);
        setIsEditMode(true);
        setCurrentOrderId(orderToLoad);
        setOriginalOrder(orderToEdit);
        
        // Enhanced customer loading with better error handling
        console.log("🔍 Looking for customer with ID:", orderToEdit.customerId);
        console.log("📊 Available customers:", customers.length);
        
        const customer = customers.find(c => c.id === orderToEdit?.customerId);
        if (customer) {
          console.log("✅ Customer found and set:", customer.name);
          setSelectedCustomer(customer);
          const displayValue = customer.code ? `${customer.code} - ${customer.name}` : customer.name;
          setCustomerInputValue(displayValue);
          console.log("📝 Customer input value set to:", displayValue);
        } else {
          console.warn("⚠️ Customer not found for ID:", orderToEdit?.customerId);
          // Set customer name from order data as fallback
          if (orderToEdit.customerName) {
            console.log("🔄 Using customer name from order:", orderToEdit.customerName);
            setCustomerInputValue(orderToEdit.customerName);
          }
          toast({
            title: "Atenção",
            description: "Cliente associado não encontrado na lista atual, mas o nome será mantido."
          });
        }
        
        // Enhanced sales rep loading
        console.log("🔍 Looking for sales rep with ID:", orderToEdit.salesRepId);
        const salesRep = salesReps.find(s => s.id === orderToEdit?.salesRepId);
        if (salesRep) {
          console.log("✅ Sales rep found and set:", salesRep.name);
          setSelectedSalesRep(salesRep);
          const displayValue = salesRep.code ? `${salesRep.code} - ${salesRep.name}` : salesRep.name;
          setSalesRepInputValue(displayValue);
        } else {
          console.warn("⚠️ Sales rep not found for ID:", orderToEdit?.salesRepId);
          // Set sales rep name from order data as fallback
          if (orderToEdit.salesRepName) {
            console.log("🔄 Using sales rep name from order:", orderToEdit.salesRepName);
            setSalesRepInputValue(orderToEdit.salesRepName);
          }
          toast({
            title: "Atenção",
            description: "Vendedor associado não encontrado na lista atual, mas o nome será mantido."
          });
        }
        
        // Enhanced order items processing with validation
        if (orderToEdit?.items && Array.isArray(orderToEdit.items)) {
          console.log("📦 Processing order items:", orderToEdit.items.length);
          
          const validatedItems: OrderItem[] = orderToEdit.items.map((item, index) => {
            if (!item) {
              console.warn(`⚠️ Null item found at index ${index}`);
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
            
            // Ensure all required fields are present and valid
            const validatedItem: OrderItem = {
              id: item.id || uuidv4(),
              productId: item.productId || `unknown-${index}`,
              productName: item.productName || "Item sem nome",
              productCode: item.productCode || 0,
              quantity: Math.max(item.quantity || 1, 1),
              unitPrice: Math.max(item.unitPrice || item.price || 0, 0),
              price: Math.max(item.price || item.unitPrice || 0, 0),
              discount: Math.max(item.discount || 0, 0),
              total: Math.max((item.unitPrice || item.price || 0) * (item.quantity || 1), 0)
            };
            
            console.log(`✅ Validated item ${index + 1}:`, validatedItem.productName);
            return validatedItem;
          });
          
          console.log("📋 Setting validated order items:", validatedItems.length);
          setOrderItems(validatedItems);
        } else {
          console.warn("⚠️ No valid items found in order");
          setOrderItems([]);
        }
        
        // Set payment table with validation
        if (orderToEdit?.paymentTableId) {
          console.log("💳 Setting payment table ID:", orderToEdit.paymentTableId);
          const tableExists = paymentTables.some(pt => pt.id === orderToEdit.paymentTableId);
          
          if (tableExists) {
            setSelectedPaymentTable(orderToEdit.paymentTableId);
          } else {
            console.warn("⚠️ Payment table not found:", orderToEdit.paymentTableId);
            setSelectedPaymentTable(paymentTables.length > 0 ? paymentTables[0].id : 'default-table');
          }
        }
        
        if (!preloadedOrder) {
          toast({
            title: "Pedido carregado",
            description: `Editando pedido #${orderToLoad.substring(0, 6)}`
          });
        }
        
        console.log("🎉 Order loading completed successfully");
      } catch (error) {
        console.error("❌ Error loading order:", error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        setLoadError(errorMsg);
        
        toast({
          title: "Erro ao carregar pedido",
          description: `Ocorreu um erro: ${errorMsg}`,
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate('/pedidos');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    const orderIdToLoad = orderId || searchParams.get('id');
    
    if (orderIdToLoad) {
      loadOrder(orderIdToLoad);
    }
  }, [preloadedOrder, orderId, searchParams, getOrderById, customers, salesReps, paymentTables, navigate]);

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

  // Enhanced add item function with detailed logging and state management
  const handleAddItem = (product: Product, quantity: number, price: number) => {
    console.log("🛒 === ADDING ITEM TO ORDER (EDIT MODE) ===");
    console.log("📦 Product:", product);
    console.log("🔢 Quantity:", quantity);
    console.log("💰 Price:", price);
    console.log("📋 Current order items:", orderItems.length);
    console.log("✏️ Is edit mode:", isEditMode);
    
    if (!product || !product.id) {
      console.error("❌ Invalid product provided:", product);
      toast({
        title: "Erro",
        description: "Produto inválido selecionado",
        variant: "destructive"
      });
      return;
    }

    if (!quantity || quantity <= 0) {
      console.error("❌ Invalid quantity provided:", quantity);
      toast({
        title: "Erro", 
        description: "Quantidade deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (price < 0) {
      console.error("❌ Invalid price provided:", price);
      toast({
        title: "Erro",
        description: "Preço deve ser maior ou igual a zero",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if product already exists in order
      const existingItemIndex = orderItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex !== -1) {
        console.log("🔄 Updating existing item at index:", existingItemIndex);
        const existingItem = orderItems[existingItemIndex];
        const newQuantity = (existingItem.quantity || 0) + quantity;
        const newTotal = price * newQuantity;
        
        const updatedItems = [...orderItems];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          unitPrice: price,
          price: price,
          total: newTotal
        };
        
        setOrderItems(updatedItems);
        console.log("✅ Updated existing item. New quantity:", newQuantity);
        
        toast({
          title: "Item atualizado",
          description: `${quantity}x ${product.name} adicionado ao item existente (total: ${newQuantity})`
        });
      } else {
        // Create new item
        const newItem: OrderItem = {
          id: uuidv4(),
          productId: product.id,
          productName: product.name,
          productCode: product.code || 0,
          quantity: quantity,
          price: price,
          unitPrice: price,
          discount: 0,
          total: price * quantity
        };
        
        console.log("➕ Adding new item:", newItem);
        const updatedItems = [...orderItems, newItem];
        setOrderItems(updatedItems);
        console.log("✅ Added new item. Total items:", updatedItems.length);
        
        toast({
          title: "Item adicionado",
          description: `${quantity}x ${product.name} adicionado ao pedido`
        });
      }
    } catch (error) {
      console.error("❌ Error in handleAddItem:", error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item ao pedido",
        variant: "destructive"
      });
    }
  };

  // Enhanced remove item function with proper state management
  const handleRemoveItem = (productId: string) => {
    console.log("🗑️ Removing item with productId:", productId);
    console.log("📋 Current items before removal:", orderItems.length);
    
    const itemToRemove = orderItems.find(item => item.productId === productId);
    if (!itemToRemove) {
      console.warn("⚠️ Item not found for removal:", productId);
      toast({
        title: "Erro",
        description: "Item não encontrado para remoção",
        variant: "destructive"
      });
      return;
    }
    
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    setOrderItems(updatedItems);
    
    console.log("✅ Item removed successfully. Remaining items:", updatedItems.length);
    console.log("🗑️ Removed item:", itemToRemove.productName);
    
    toast({
      title: "Item removido",
      description: `${itemToRemove.productName} removido do pedido`
    });
  };

  // Order creation/update function with improved error handling
  const handleCreateOrder = async () => {
    // Form validation
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
      console.log("💾 Starting order submission process...");
      console.log("🌐 Current connection status:", connectionStatus);
      console.log("📦 Order items to save:", orderItems);
      
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
      
      console.log("✅ Normalized items for saving:", normalizedItems);
      
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
      
      console.log("💾 Saving order with data:", orderData);
      
      let orderId = "";
      let isPromissoryNote = false;
      
      if (isEditMode && currentOrderId) {
        console.log("✏️ Updating existing order:", currentOrderId);
        await updateOrder(currentOrderId, {
          ...orderData,
          items: normalizedItems
        });
        
        orderId = currentOrderId;
        console.log("✅ Order successfully updated:", orderId);
        
        toast({
          title: "Pedido Atualizado",
          description: `Pedido #${orderId.substring(0, 6)} atualizado com sucesso.`
        });

        // Check if this is a promissory note payment table
        isPromissoryNote = selectedTable?.type === 'promissoria';
        
        // Create automatic payment record if needed
        if (isPromissoryNote && orderId) {
          console.log("📝 Creating automatic payment record for promissory note");
          await createAutomaticPaymentRecord({
            ...orderData,
            id: orderId,
            code: orderData.code || 0
          } as Order);
          
          toast({
            title: "Nota Promissória Gerada",
            description: "A nota promissória foi gerada e pode ser acessada na aba de Pagamentos."
          });
        }
      } else {
        console.log("➕ Creating new order");
        orderId = await addOrder(orderData as Omit<Order, "id">);
        console.log("✅ Order created with ID:", orderId);
        
        if (orderId) {
          toast({
            title: "Pedido Criado",
            description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
          });
          
          // Check if this is a promissory note payment table
          isPromissoryNote = selectedTable?.type === 'promissoria';
          
          // Create automatic payment record if needed
          if (isPromissoryNote) {
            console.log("📝 Creating automatic payment record for promissory note");
            await createAutomaticPaymentRecord({
              ...orderData,
              id: orderId,
              code: orderData.code || 0
            } as Order);
            
            toast({
              title: "Nota Promissória Gerada",
              description: "A nota promissória foi gerada e pode ser acessada na aba de Pagamentos."
            });
          }
        } else {
          throw new Error("Falha ao criar pedido: ID não retornado");
        }
      }
      
      resetForm();
      
      // Always navigate back to orders list after creating/updating an order
      setTimeout(() => {
        navigate('/pedidos');
      }, 1500);
    } catch (error) {
      console.error("❌ Erro ao processar pedido:", error);
      toast({
        title: "Erro ao processar pedido",
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
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
      toast({
        title: "Atenção",
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
