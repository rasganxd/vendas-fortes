
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import MobileOrderImportPage from '@/components/orders/MobileOrderImportPage';

export default function MobileOrderImport() {
  return (
    <PageLayout 
      title="Importação Mobile" 
      subtitle="Importação manual de pedidos do Mobile"
    >
      <div className="max-w-7xl mx-auto">
        <MobileOrderImportPage />
      </div>
    </PageLayout>
  );
}
