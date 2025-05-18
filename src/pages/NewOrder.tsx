
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import OrderFormContainer from '@/components/orders/OrderFormContainer';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';

export default function NewOrder() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const { getOrderById } = useOrders();
  const navigate = useNavigate();
  
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Validate order ID to prevent navigation to invalid orders
  useEffect(() => {
    const validateOrderId = async () => {
      if (orderId) {
        try {
          setIsValidating(true);
          setValidationError(null);
          console.log("Validating order ID:", orderId);
          
          // Get order data - will be passed to OrderFormContainer to prevent duplicate requests
          const order = await getOrderById(orderId);
          
          if (!order) {
            console.error("Order not found with ID:", orderId);
            setIsValid(false);
            setValidationError(`Pedido com ID ${orderId} não encontrado`);
            
            // Navigate back to orders after delay
            setTimeout(() => {
              navigate('/pedidos', { 
                state: { error: `Pedido com ID ${orderId} não encontrado` }
              });
            }, 3000);
          } else {
            console.log("Order validated successfully:", order.id);
            setOrderData(order);
            setIsValid(true);
          }
        } catch (error) {
          console.error("Error validating order ID:", error);
          setIsValid(false);
          setValidationError(error instanceof Error ? error.message : "Erro ao validar pedido");
        } finally {
          setIsValidating(false);
        }
      }
    };
    
    validateOrderId();
  }, [orderId, getOrderById, navigate]);
  
  const pageTitle = orderId ? "Edição de Pedido" : "Digitação de Pedidos";
  
  if (orderId && isValidating) {
    return (
      <PageLayout title={pageTitle}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
              <p className="text-lg text-gray-700">Validando pedido...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (orderId && !isValid && !isValidating) {
    return (
      <PageLayout title="Pedido não encontrado">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="rounded-full h-12 w-12 border-2 border-red-500 mx-auto mb-4 flex items-center justify-center">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-lg text-gray-700 mb-2">Pedido não encontrado</p>
              <p className="text-sm text-gray-500">{validationError || "O pedido solicitado não está disponível ou foi excluído."}</p>
              <button 
                onClick={() => navigate('/pedidos')} 
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
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
    <PageLayout title={pageTitle}>
      <div className="max-w-7xl mx-auto">
        <OrderFormContainer preloadedOrder={orderData} orderId={orderId} />
      </div>
    </PageLayout>
  );
}
