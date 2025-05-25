
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

    return true;
  }, [selectedCustomer, selectedSalesRep, orderItems, connectionStatus]);

  const createPromissoryNotePayment = useCallback(async (order: Order, paymentTable: PaymentTable) => {
    try {
      console.log('Creating promissory note payment for order:', order.id);
      
      // Create a payment record for the promissory note
      const now = new Date();
      const dueDate = new Date(now);
      
      // Add 30 days by default, or use the first term if available
      if (paymentTable.terms && paymentTable.terms.length > 0) {
        dueDate.setDate(now.getDate() + paymentTable.terms[0].days);
      } else {
        dueDate.setDate(now.getDate() + 30);
      }

      await addPayment({
        orderId: order.id,
        amount: order.total,
        method: 'Nota Promissória',
        status: 'pending',
        date: now,
        dueDate: dueDate,
        notes: `Nota promissória - Pedido #${order.code}`,
        customerName: order.customerName,
        createdAt: now,
        updatedAt: now
      });

      console.log('Promissory note payment created successfully');
    } catch (error) {
      console.error('Error creating promissory note payment:', error);
      // Don't throw error to avoid breaking the order creation
      toast({
        title: "Aviso",
        description: "Pedido criado, mas houve um problema ao gerar a nota promissória.",
        variant: "destructive"
      });
    }
  }, [addPayment]);

  const handleCreateOrder = useCallback(async () => {
    if (!validateOrderForm()) return;

    try {
      setIsSubmitting(true);
      setIsSaving(true);

      // Show immediate feedback
      toast({
        title: isEditMode ? "Salvando alterações..." : "Criando pedido...",
        description: "Por favor, aguarde."
      });

      const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
      const total = orderItems.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0);

      if (isEditMode && currentOrderId && originalOrder) {
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
          const updatedOrder = { ...originalOrder, ...orderUpdate, id: currentOrderId };
          await createPromissoryNotePayment(updatedOrder as Order, selectedTable);
        }
        
        // Smooth transition before navigation
        setTimeout(() => {
          navigate('/pedidos');
        }, 1000);
      } else {
        // Create new order
        const orderCode = await generateNextCode();
        
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
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const orderId = await addOrder(newOrder);
        
        // Check if payment table is promissory note type and create payment
        if (selectedTable && (selectedTable.type === 'promissoria' || selectedTable.type === 'promissory_note')) {
          const createdOrder = { ...newOrder, id: orderId } as Order;
          await createPromissoryNotePayment(createdOrder, selectedTable);
        }
        
        resetForm();
        
        // Smooth transition before navigation
        setTimeout(() => {
          navigate('/pedidos');
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating/updating order:', error);
      toast({
        title: isEditMode ? "Erro ao atualizar pedido" : "Erro ao criar pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsSaving(false);
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
