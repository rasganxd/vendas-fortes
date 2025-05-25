
import React, { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProductPricing from '@/components/products/ProductPricing';
import { useAppData } from '@/context/providers/AppDataProvider';

const ProductPricingPage = () => {
  const { refreshProducts } = useAppData();

  // Listen for product updates to refresh pricing
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log("Products updated event received in ProductPricing page");
      // Products will be automatically updated via centralized hook
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  return (
    <PageLayout title="Precificação de Produtos">
      <ProductPricing />
    </PageLayout>
  );
};

export default ProductPricingPage;
