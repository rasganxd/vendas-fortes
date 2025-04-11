
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import OrderFormContainer from '@/components/orders/OrderFormContainer';
import { useSearchParams } from 'react-router-dom';

export default function NewOrder() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  
  const pageTitle = orderId ? "Edição de Pedido" : "Digitação de Pedidos";
  
  return (
    <PageLayout title={pageTitle}>
      <div className="max-w-6xl mx-auto">
        <OrderFormContainer />
      </div>
    </PageLayout>
  );
}
