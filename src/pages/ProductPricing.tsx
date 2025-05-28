
import React, { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProductPricing from '@/components/products/ProductPricing';
import { useAppData } from '@/context/providers/AppDataProvider';

const ProductPricingPage = () => {
  console.log("=== ProductPricingPage component rendering ===");
  
  const { refreshProducts, products } = useAppData();

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

  // Debug logging
  console.log("ProductPricingPage - products count:", products?.length || 0);
  console.log("ProductPricingPage - products data:", products);

  return (
    <PageLayout title="Precificação de Produtos">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          DEBUG: {products?.length || 0} produtos disponíveis para precificação
        </p>
      </div>
      <ProductPricing />
    </PageLayout>
  );
};

export default ProductPricingPage;
