
import { useState } from 'react';
import { Customer, SalesRep, OrderItem, Order, PaymentTable } from '@/types';
import { ConnectionStatus } from '@/context/AppContextTypes';
import { useOrders } from '@/hooks/useOrders';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UseOrderOperationsProps {
  selectedCustomer: Customer | null;
  selectedSalesRep: SalesRep | null;
  orderItems: OrderItem[];
  selectedPaymentTable: string;
  paymentTables: PaymentTable[];
  isEditMode: boolean;
  currentOrderId: string | null;
  originalOrder: Order | null;
  connectionStatus: ConnectionStatus;
  resetForm: () => void;
}

export function useOrderOperations({
  selectedCustomer,
  selectedSalesRep,
  orderItems,
  selectedPaymentTable,
  paymentTables,
  isEditMode,
  currentOrderId,
  originalOrder,
  connectionStatus,
  resetForm
}: UseOrderOperationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addOrder, updateOrder, refreshOrders } = useOrders();
  const navigate = useNavigate();

  const validateOrder = (): string | null => {
    if (!selectedCustomer) {
      return "Selecione um cliente";
    }
    
    if (!selectedSalesRep) {
      return "Selecione um vendedor";
    }
    
    if (orderItems.length === 0) {
      return "Adicione pelo menos um item ao pedido";
    }
    
    // Fix: Check for 'error' instead of 'disconnected' to match ConnectionStatus type
    if (connectionStatus === 'error') {
      return "Sem conexão com o servidor. Verifique sua internet.";
    }
    
    return null;
  };

  const buildOrderData = (): Omit<Order, 'id'> => {
    const paymentTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
    const total = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
    
    return {
      code: originalOrder?.code || 0,
      customerId: selectedCustomer?.id || '',
      customerName: selectedCustomer?.name || '',
      salesRepId: selectedSalesRep?.id || '',
      salesRepName: selectedSalesRep?.name || '',
      date: originalOrder?.date || new Date(),
      dueDate: originalOrder?.dueDate || new Date(),
      items: orderItems,
      total: total,
      discount: originalOrder?.discount || 0,
      status: originalOrder?.status || 'draft',
      paymentStatus: originalOrder?.paymentStatus || 'pending',
      paymentMethod: paymentTable?.name || '',
      paymentMethodId: '',
      paymentTableId: selectedPaymentTable,
      payments: originalOrder?.payments || [],
      notes: originalOrder?.notes || '',
      createdAt: originalOrder?.createdAt || new Date(),
      updatedAt: new Date(),
      archived: originalOrder?.archived || false,
      deliveryAddress: originalOrder?.deliveryAddress || '',
      deliveryCity: originalOrder?.deliveryCity || '',
      deliveryState: originalOrder?.deliveryState || '',
      deliveryZip: originalOrder?.deliveryZip || ''
    };
  };

  const handleCreateOrder = async (): Promise<void> => {
    console.log("💾 === STARTING ORDER SAVE PROCESS ===");
    console.log("📝 Edit Mode:", isEditMode);
    console.log("🆔 Current Order ID:", currentOrderId);
    console.log("📦 Items Count:", orderItems.length);
    console.log("👤 Customer:", selectedCustomer?.name);
    console.log("👨‍💼 Sales Rep:", selectedSalesRep?.name);
    
    if (isSubmitting) {
      console.log("⚠️ Already submitting, skipping");
      return;
    }

    // Validate order
    const validationError = validateOrder();
    if (validationError) {
      console.error("❌ Validation failed:", validationError);
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🔄 Setting submitting state to true");

      const orderData = buildOrderData();
      console.log("📋 Order data built:", orderData);

      if (isEditMode && currentOrderId) {
        console.log("✏️ Updating existing order:", currentOrderId);
        
        await updateOrder(currentOrderId, orderData);
        
        console.log("✅ Order updated successfully");
        
        // Fix: Remove duration property
        toast({
          title: "Pedido atualizado",
          description: `Pedido #${orderData.code} foi atualizado com sucesso!`
        });

        // Navigate back to orders list after successful update
        setTimeout(() => {
          navigate('/pedidos');
        }, 1500);
        
      } else {
        console.log("➕ Creating new order");
        
        const newOrderId = await addOrder(orderData);
        
        if (newOrderId) {
          console.log("✅ Order created successfully with ID:", newOrderId);
          
          // Fix: Remove duration property
          toast({
            title: "Pedido criado",
            description: `Pedido #${orderData.code} foi criado com sucesso!`
          });

          // Reset form after successful creation
          resetForm();
          
          // Navigate back to orders list
          setTimeout(() => {
            navigate('/pedidos');
          }, 1500);
        }
      }

      // Force refresh orders list
      setTimeout(() => {
        refreshOrders();
      }, 500);

    } catch (error) {
      console.error("❌ Error saving order:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Fix: Remove duration property
      toast({
        title: isEditMode ? "Erro ao atualizar pedido" : "Erro ao criar pedido",
        description: `Ocorreu um erro: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      console.log("🔄 Setting submitting state to false");
    }
  };

  return {
    isSubmitting,
    handleCreateOrder
  };
}
