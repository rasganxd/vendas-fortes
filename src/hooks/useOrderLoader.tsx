
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Order, Customer, SalesRep } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { toast } from '@/hooks/use-toast';
import { useOrderValidator } from './orderLoader/useOrderValidator';
import { useOrderFormPopulator } from './orderLoader/useOrderFormPopulator';

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

export function useOrderLoader(props: UseOrderLoaderProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const loadingRef = useRef(false);
  const loadedOrderIdRef = useRef<string | null>(null);

  const { validateAndFixOrderItems } = useOrderValidator();
  const { populateOrderForm } = useOrderFormPopulator(
    props.customers,
    props.salesReps,
    props.paymentTables,
    props.setSelectedCustomer,
    props.setSelectedSalesRep,
    props.setOrderItems,
    props.setSelectedPaymentTable,
    props.setCustomerInputValue,
    props.setSalesRepInputValue,
    props.setIsEditMode,
    props.setCurrentOrderId,
    props.setOriginalOrder
  );

  useEffect(() => {
    const orderIdToLoad = props.orderId || searchParams.get('id');
    
    if (!orderIdToLoad || loadingRef.current || loadedOrderIdRef.current === orderIdToLoad) {
      return;
    }

    const loadOrder = async (orderToLoad: string) => {
      try {
        loadingRef.current = true;
        setIsLoading(true);
        setLoadError(null);
        
        console.log("🔄 Loading order for editing:", orderToLoad);
        
        let orderToEdit: Order | null = null;
        
        if (props.preloadedOrder && props.preloadedOrder.id === orderToLoad) {
          console.log("✅ Using preloaded order data:", props.preloadedOrder.id);
          orderToEdit = props.preloadedOrder;
        } else {
          console.log("🔍 Fetching order data from service:", orderToLoad);
          orderToEdit = await getOrderById(orderToLoad);
        }
        
        if (!orderToEdit) {
          throw new Error("Pedido não encontrado");
        }
        
        loadedOrderIdRef.current = orderToLoad;
        
        const validatedItems = validateAndFixOrderItems(orderToEdit);
        populateOrderForm(orderToEdit, orderToLoad, validatedItems);
        
        if (!props.preloadedOrder) {
          toast({
            title: "Pedido carregado",
            description: `Editando pedido #${orderToEdit.code || orderToLoad.substring(0, 6)}`
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
        
        loadedOrderIdRef.current = null;
        
        setTimeout(() => {
          navigate('/pedidos');
        }, 3000);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };
    
    loadOrder(orderIdToLoad);
  }, [props.preloadedOrder, props.orderId, searchParams, getOrderById, props.customers, props.salesReps, props.paymentTables, navigate, validateAndFixOrderItems, populateOrderForm]);

  useEffect(() => {
    return () => {
      loadingRef.current = false;
    };
  }, []);

  return { isLoading, loadError };
}
