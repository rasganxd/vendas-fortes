
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CloudOff, Check, WifiOff } from "lucide-react";
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';
import { toast } from 'sonner';

interface ProductSyncStatusProps {
  productsPending: number;
  isLoading: boolean;
  isSyncing: boolean;
  onSyncProducts: () => Promise<void>;
  onRefreshProducts: () => Promise<boolean>;
}

const ProductSyncStatus: React.FC<ProductSyncStatusProps> = ({
  productsPending,
  isLoading,
  isSyncing,
  onSyncProducts,
  onRefreshProducts
}) => {
  const { connectionStatus } = useFirebaseConnection();
  
  const handleSyncClick = async () => {
    if (connectionStatus !== 'connected') {
      toast("Sem conexão", {
        description: "Você precisa estar conectado para sincronizar produtos."
      });
      return;
    }
    
    await onSyncProducts();
  };
  
  return (
    <div className="flex items-center gap-2 ml-auto">
      {connectionStatus !== 'connected' && (
        <Badge variant="outline" className="gap-1 py-1 px-2 border-amber-400">
          <WifiOff size={14} className="text-amber-500" />
          <span className="text-amber-500 ml-1">Offline</span>
        </Badge>
      )}
      
      {productsPending > 0 && (
        <Badge variant="outline" className="gap-1 py-1 px-2 border-amber-400">
          <CloudOff size={14} className="text-amber-500" />
          <span className="text-amber-500 ml-1">{productsPending} pendente{productsPending !== 1 ? 's' : ''}</span>
        </Badge>
      )}
      
      {connectionStatus === 'connected' && productsPending === 0 && !isLoading && !isSyncing && (
        <Badge variant="outline" className="gap-1 py-1 px-2 border-green-400">
          <Check size={14} className="text-green-600" />
          <span className="text-green-600 ml-1">Sincronizado</span>
        </Badge>
      )}
      
      {productsPending > 0 && connectionStatus === 'connected' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSyncClick}
          disabled={isSyncing || isLoading}
        >
          <CloudOff className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-pulse' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshProducts}
        disabled={isLoading || isSyncing}
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Atualizando...' : 'Atualizar'}
      </Button>
    </div>
  );
};

export default ProductSyncStatus;
