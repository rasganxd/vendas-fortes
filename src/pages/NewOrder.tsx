
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import OrderFormContainer from '@/components/orders/OrderFormContainer';
import { OrderLoadingSkeleton } from '@/components/ui/order-skeleton';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';

export default function NewOrder() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const { getOrderById } = useOrders();
  const navigate = useNavigate();
  
  const [isValidating, setIsValidating] = useState(!!orderId);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Optimized order validation
  useEffect(() => {
    if (!orderId) return;

    const validateOrder = async () => {
      try {
        setIsValidating(true);
        const order = await getOrderById(orderId);
        
        if (!order) {
          setValidationError(`Pedido com ID ${orderId} não encontrado`);
          setTimeout(() => navigate('/pedidos', { 
            state: { error: `Pedido não encontrado` }
          }), 2000);
        } else {
          setOrderData(order);
        }
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : "Erro ao validar pedido");
      } finally {
        setIsValidating(false);
      }
    };
    
    validateOrder();
  }, [orderId, getOrderById, navigate]);
  
  const pageTitle = orderId ? "Edição de Pedido" : "Digitação de Pedidos";
  
  if (isValidating) {
    return (
      <PageLayout title={pageTitle} fullWidth={true}>
        <div className="w-full">
          <OrderLoadingSkeleton />
        </div>
      </PageLayout>
    );
  }
  
  if (validationError) {
    return (
      <PageLayout title="Erro" fullWidth={true}>
        <div className="w-full">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="rounded-full h-12 w-12 border-2 border-red-500 mx-auto mb-4 flex items-center justify-center">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-lg text-gray-700 mb-2">Erro ao carregar pedido</p>
              <p className="text-sm text-gray-500">{validationError}</p>
              <button 
                onClick={() => navigate('/pedidos')} 
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors"
              >
                Voltar para lista de pedidos
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title={pageTitle} showConnectionStatus={true} fullWidth={true}>
      <div className="w-full">
        <OrderFormContainer preloadedOrder={orderData} orderId={orderId} />
      </div>
    </PageLayout>
  );
}
