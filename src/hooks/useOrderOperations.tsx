
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, Customer, SalesRep, OrderItem } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface UseOrderOperationsProps {
  selectedCustomer: Customer | null;
  selectedSalesRep: SalesRep | null;
  orderItems: OrderItem[];
  selectedPaymentTable: string;
  paymentTables: any[];
  isEditMode: boolean;
  currentOrderId: string | null;
  originalOrder: Order | null;
  connectionStatus: any;
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
  const { addOrder, updateOrder } = useOrders();
  const { createAutomaticPaymentRecord } = usePayments();
  const navigate = useNavigate();

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
      
      // Normalize order items
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
      
      const calculatedTotal = normalizedItems.reduce((sum, item) => 
        sum + ((item.quantity || 1) * (item.unitPrice || item.price || 0)), 0);
      
      const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
      
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

        isPromissoryNote = selectedTable?.type === 'promissoria';
        
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
          
          isPromissoryNote = selectedTable?.type === 'promissoria';
          
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

  return {
    isSubmitting,
    handleCreateOrder
  };
}
