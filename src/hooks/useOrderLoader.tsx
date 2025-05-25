
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Order, Customer, SalesRep } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface UseOrderLoaderProps {
  preloadedOrder?: Order | null;
  orderId?: string | null;
  customers: Customer[];
  salesReps: SalesRep[];
  paymentTables: any[];
  setSelectedCustomer: (customer: Customer | null) => void;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
  setOrderItems: (items: any[]) => void;
  setSelectedPaymentTable: (id: string) => void;
  setCustomerInputValue: (value: string) => void;
  setSalesRepInputValue: (value: string) => void;
  setIsEditMode: (mode: boolean) => void;
  setCurrentOrderId: (id: string | null) => void;
  setOriginalOrder: (order: Order | null) => void;
}

export function useOrderLoader({
  preloadedOrder,
  orderId,
  customers,
  salesReps,
  paymentTables,
  setSelectedCustomer,
  setSelectedSalesRep,
  setOrderItems,
  setSelectedPaymentTable,
  setCustomerInputValue,
  setSalesRepInputValue,
  setIsEditMode,
  setCurrentOrderId,
  setOriginalOrder
}: UseOrderLoaderProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        
        // Load customer
        const customer = customers.find(c => c.id === orderToEdit?.customerId);
        if (customer) {
          console.log("✅ Customer found and set:", customer.name);
          setSelectedCustomer(customer);
          const displayValue = customer.code ? `${customer.code} - ${customer.name}` : customer.name;
          setCustomerInputValue(displayValue);
        } else {
          console.warn("⚠️ Customer not found for ID:", orderToEdit?.customerId);
          if (orderToEdit.customerName) {
            setCustomerInputValue(orderToEdit.customerName);
          }
          toast({
            title: "Atenção",
            description: "Cliente associado não encontrado na lista atual, mas o nome será mantido."
          });
        }
        
        // Load sales rep
        const salesRep = salesReps.find(s => s.id === orderToEdit?.salesRepId);
        if (salesRep) {
          console.log("✅ Sales rep found and set:", salesRep.name);
          setSelectedSalesRep(salesRep);
          const displayValue = salesRep.code ? `${salesRep.code} - ${salesRep.name}` : salesRep.name;
          setSalesRepInputValue(displayValue);
        } else {
          console.warn("⚠️ Sales rep not found for ID:", orderToEdit?.salesRepId);
          if (orderToEdit.salesRepName) {
            setSalesRepInputValue(orderToEdit.salesRepName);
          }
          toast({
            title: "Atenção",
            description: "Vendedor associado não encontrado na lista atual, mas o nome será mantido."
          });
        }
        
        // Load order items
        if (orderToEdit?.items && Array.isArray(orderToEdit.items)) {
          console.log("📦 Processing order items:", orderToEdit.items.length);
          
          const validatedItems = orderToEdit.items.map((item, index) => {
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
            
            return {
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
          });
          
          setOrderItems(validatedItems);
        } else {
          console.warn("⚠️ No valid items found in order");
          setOrderItems([]);
        }
        
        // Set payment table
        if (orderToEdit?.paymentTableId) {
          const tableExists = paymentTables.some(pt => pt.id === orderToEdit.paymentTableId);
          if (tableExists) {
            setSelectedPaymentTable(orderToEdit.paymentTableId);
          } else {
            setSelectedPaymentTable(paymentTables.length > 0 ? paymentTables[0].id : 'default-table');
          }
        }
        
        if (!preloadedOrder) {
          toast({
            title: "Pedido carregado",
            description: `Editando pedido #${orderToLoad.substring(0, 6)}`
          });
        }
        
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

  return { isLoading, loadError };
}
