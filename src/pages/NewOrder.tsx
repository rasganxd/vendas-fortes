
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import OrderFormContainer from '@/components/orders/OrderFormContainer';

export default function NewOrder() {
  return (
    <PageLayout title="Digitação de Pedidos">
      <div className="max-w-6xl mx-auto">
        <OrderFormContainer />
      </div>
    </PageLayout>
  );
}
