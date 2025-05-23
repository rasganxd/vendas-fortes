
import React from 'react';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

interface ProductSyncStatusProps {
  productsPending: number;
  isLoading: boolean;
  isSyncing: boolean;
  onSyncProducts: () => Promise<boolean>;
  onRefreshProducts: () => Promise<boolean>;
  hideButtons?: boolean;
}

const ProductSyncStatus: React.FC<ProductSyncStatusProps> = ({
  productsPending,
  isLoading,
  isSyncing,
  onSyncProducts,
  onRefreshProducts,
  hideButtons = false
}) => {
  return (
    <ConnectionStatus 
      pendingItems={productsPending}
      isLoading={isLoading}
      isPendingSync={isSyncing}
      onSyncPending={hideButtons ? undefined : onSyncProducts}
      onRefresh={hideButtons ? undefined : onRefreshProducts}
      className="ml-auto"
      hideWhenSynchronized={false}
      showRefresh={!hideButtons}
    />
  );
};

export default ProductSyncStatus;
