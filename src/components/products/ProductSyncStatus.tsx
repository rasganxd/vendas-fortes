
import React from 'react';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

interface ProductSyncStatusProps {
  productsPending: number;
  isLoading: boolean;
  isSyncing: boolean;
  onSyncProducts: () => Promise<boolean>;
  onRefreshProducts: () => Promise<boolean>;
}

const ProductSyncStatus: React.FC<ProductSyncStatusProps> = ({
  productsPending,
  isLoading,
  isSyncing,
  onSyncProducts,
  onRefreshProducts
}) => {
  return (
    <ConnectionStatus 
      pendingItems={productsPending}
      isLoading={isLoading}
      isPendingSync={isSyncing}
      onSyncPending={onSyncProducts}
      onRefresh={onRefreshProducts}
      className="ml-auto"
    />
  );
};

export default ProductSyncStatus;
