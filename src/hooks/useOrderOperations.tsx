
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { toast } from '@/hooks/use-toast';
import { Customer, SalesRep, OrderItem, PaymentTable, Order } from '@/types';
import { ConnectionStatus } from '@/context/AppContextTypes';

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
  const [isSaving, setIsSaving] = useState(false);
  const { addOrder, updateOrder, generateNextCode } = useOrders();
  const { addPayment } = usePayments();
  const navigate = useNavigate();

  const validateOrderForm = useCallback(() => {
    console.log('🔍 Validating order form:', {
      hasCustomer: !!selectedCustomer,
      hasSalesRep: !!selectedSalesRep,
      itemsCount: orderItems.length,
      connectionStatus
    });

    if (!selectedCustomer) {
      toast({
        title: "Cliente obrigatório",
        description: "Por favor, selecione um cliente para o pedido.",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedSalesRep) {
      toast({
        title: "Vendedor obrigatório", 
        description: "Por favor, selecione um vendedor para o pedido.",
        variant: "destructive"
      });
      return false;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive"
      });
      return false;
    }

    if (connectionStatus === 'offline') {
      toast({
        title: "Sem conexão",
        description: "Conecte-se à internet para salvar o pedido.",
        variant: "destructive"
      });
      return false;
    }

    console.log('✅ Order form validation passed');
    return true;
  }, [selectedCustomer, selectedSalesRep, orderItems, connectionStatus]);

  const createPromissoryNotePayment = useCallback(async (order: Order, paymentTable: PaymentTable) => {
    try {
      console.log('📝 Creating promissory note payment for order:', {
        orderId: order.id,
        orderCode: order.code,
        total: order.total,
        paymentTableName: paymentTable.name,
        paymentTableType: paymentTable.type,
        hasTerms: !!(paymentTable.terms && paymentTable.terms.length > 0)
      });
      
      const now = new Date();
      let dueDate = new Date(now);
      let paymentAmount = order.total;
      let notes = `Nota promissória - Pedido #${order.code}`;
      
      // Determine due date and amount based on payment terms
      if (paymentTable.terms && paymentTable.terms.length > 0) {
        const firstTerm = paymentTable.terms[0];
        dueDate.setDate(now.getDate() + firstTerm.days);
        paymentAmount = order.total * (firstTerm.percentage / 100);
        notes = `Nota promissória - Parcela 1 de ${paymentTable.terms.length} - Pedido #${order.code}`;
        
        console.log('📅 Using payment terms:', {
          termDays: firstTerm.days,
          termPercentage: firstTerm.percentage,
          calculatedAmount: paymentAmount,
          dueDate: dueDate.toISOString()
        });
      } else {
        // Default to 30 days if no terms specified
        dueDate.setDate(now.getDate() + 30);
        console.log('⚠️ No payment terms found, using default 30 days');
      }

      const paymentData = {
        orderId: order.id,
        amount: paymentAmount,
        method: 'Nota Promissória',
        status: 'pending',
        date: now,
        dueDate: dueDate,
        notes: notes,
        customerName: order.customerName,
        createdAt: now,
        updatedAt: now
      };

      console.log('💰 Payment data to be created:', paymentData);

      const paymentId = await addPayment(paymentData);
      
      if (paymentId) {
        console.log('✅ Promissory note payment created successfully with ID:', paymentId);
        
        toast({
          title: "Nota promissória criada",
          description: `Nota promissória criada para o pedido #${order.code}`,
          variant: "default"
        });
      } else {
        throw new Error('Payment ID not returned from addPayment');
      }

    } catch (error) {
      console.error('❌ Error creating promissory note payment:', error);
      
      toast({
        title: "Erro na nota promissória",
        description: "Pedido criado, mas houve um problema ao gerar a nota promissória.",
        variant: "destructive"
      });
      
      // Don't throw error to avoid breaking the order creation
    }
  }, [addPayment]);

  const handleCreateOrder = useCallback(async () => {
    if (!validateOrderForm()) return;

    try {
      setIsSubmitting(true);
      setIsSaving(true);

      console.log('🚀 Starting order creation process:', {
        isEditMode,
        currentOrderId,
        customerName: selectedCustomer?.name,
        salesRepName: selectedSalesRep?.name,
        itemsCount: orderItems.length,
        selectedPaymentTable
      });

      // Show immediate feedback
      toast({
        title: isEditMode ? "Salvando alterações..." : "Criando pedido...",
        description: "Por favor, aguarde."
      });

      const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
      const total = orderItems.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0);

      console.log('💰 Order total calculated:', total);
      console.log('📋 Selected payment table:', {
        id: selectedTable?.id,
        name: selectedTable?.name,
        type: selectedTable?.type,
        isPromissory: selectedTable?.type === 'promissoria' || selectedTable?.type === 'promissory_note'
      });

      if (isEditMode && currentOrderId && originalOrder) {
        console.log('✏️ Updating existing order:', currentOrderId);
        
        // Update existing order
        const orderUpdate: Partial<Order> = {
          customerId: selectedCustomer!.id,
          customerName: selectedCustomer!.name,
          salesRepId: selectedSalesRep!.id,
          salesRepName: selectedSalesRep!.name,
          paymentTableId: selectedPaymentTable,
          paymentMethod: selectedTable?.name || '',
          total,
          items: orderItems,
          updatedAt: new Date()
        };

        await updateOrder(currentOrderId, orderUpdate);
        
        // Check if payment table is promissory note type and create payment if needed
        if (selectedTable && (selectedTable.type === 'promissoria' || selectedTable.type === 'promissory_note')) {
          console.log('📝 Creating promissory note for updated order');
          const updatedOrder = { ...originalOrder, ...orderUpdate, id: currentOrderId };
          await createPromissoryNotePayment(updatedOrder as Order, selectedTable);
        }
        
        console.log('✅ Order updated successfully');
        
        // Smooth transition before navigation
        setTimeout(() => {
          navigate('/pedidos');
        }, 1000);
      } else {
        console.log('➕ Creating new order');
        
        // Create new order
        const orderCode = await generateNextCode();
        console.log('🔢 Generated order code:', orderCode);
        
        const newOrder: Omit<Order, 'id'> = {
          code: orderCode,
          customerId: selectedCustomer!.id,
          customerName: selectedCustomer!.name,
          salesRepId: selectedSalesRep!.id,
          salesRepName: selectedSalesRep!.name,
          date: new Date(),
          total,
          discount: 0,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: selectedTable?.name || '',
          paymentMethodId: '',
          paymentTableId: selectedPaymentTable,
          payments: [],
          archived: false,
          dueDate: new Date(),
          deliveryAddress: '',
          deliveryCity: '',
          deliveryState: '',
          deliveryZip: '',
          notes: '',
          items: orderItems,
          importStatus: 'imported',
          sourceProject: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('📋 New order data prepared:', {
          code: newOrder.code,
          customer: newOrder.customerName,
          salesRep: newOrder.salesRepName,
          total: newOrder.total,
          itemsCount: newOrder.items.length,
          paymentTable: selectedTable?.name,
          paymentTableType: selectedTable?.type
        });

        const orderId = await addOrder(newOrder);
        console.log('✅ Order created with ID:', orderId);
        
        // Check if payment table is promissory note type and create payment
        if (selectedTable && (selectedTable.type === 'promissoria' || selectedTable.type === 'promissory_note')) {
          console.log('📝 Creating promissory note for new order');
          const createdOrder = { ...newOrder, id: orderId } as Order;
          await createPromissoryNotePayment(createdOrder, selectedTable);
        } else {
          console.log('ℹ️ Payment table is not promissory type, skipping note creation');
        }
        
        resetForm();
        console.log('🔄 Form reset completed');
        
        // Smooth transition before navigation
        setTimeout(() => {
          navigate('/pedidos');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error creating/updating order:', error);
      toast({
        title: isEditMode ? "Erro ao atualizar pedido" : "Erro ao criar pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsSaving(false);
      console.log('🏁 Order operation completed');
    }
  }, [
    validateOrderForm, isEditMode, currentOrderId, originalOrder,
    selectedCustomer, selectedSalesRep, selectedPaymentTable,
    paymentTables, orderItems, updateOrder, generateNextCode,
    addOrder, resetForm, navigate, createPromissoryNotePayment
  ]);

  return {
    isSubmitting,
    isSaving,
    handleCreateOrder
  };
}
