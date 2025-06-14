
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CloudOff, Check, WifiOff, Wifi } from "lucide-react";
import { useConnection } from '@/context/providers/ConnectionProvider';
import { toast } from 'sonner';

interface ConnectionStatusProps {
  showRefresh?: boolean;
  onRefresh?: () => Promise<boolean>;
  pendingItems?: number;
  isPendingSync?: boolean;
  onSyncPending?: () => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
  hideWhenSynchronized?: boolean;
  showButtons?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showRefresh = true,
  onRefresh,
  pendingItems = 0,
  isPendingSync = false,
  onSyncPending,
  isLoading = false,
  className = '',
  hideWhenSynchronized = false,
  showButtons = true
}) => {
  const {
    connectionStatus,
    reconnect,
    isOnline
  } = useConnection();

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      try {
        await reconnect();
        toast("Conexão atualizada", {
          description: "Status de conexão atualizado."
        });
      } catch (error) {
        toast("Erro", {
          description: "Não foi possível atualizar a conexão.",
          style: {
            backgroundColor: 'rgb(239, 68, 68)',
            color: 'white'
          }
        });
      }
    }
  };

  const handleSyncClick = async () => {
    if (connectionStatus !== 'connected') {
      toast("Sem conexão", {
        description: "Você precisa estar conectado para sincronizar os dados."
      });
      return;
    }
    if (onSyncPending) {
      await onSyncPending();
    }
  };

  // If hideWhenSynchronized is true and everything is synchronized, return null
  if (hideWhenSynchronized && connectionStatus === 'connected' && pendingItems === 0 && !isLoading && !isPendingSync) {
    return null;
  }

  return <div className={`flex items-center gap-2 ${className}`}>
      {connectionStatus === 'connected' && (
        <Badge variant="success" className="gap-1 py-1 px-2">
          <Wifi size={14} />
          <span className="ml-1">Online</span>
        </Badge>
      )}
      
      {connectionStatus !== 'connected' && (
        <Badge variant="outline" className="gap-1 py-1 px-2 border-amber-400">
          <WifiOff size={14} className="text-amber-500" />
          <span className="text-amber-500 ml-1">Offline</span>
        </Badge>
      )}
      
      {pendingItems > 0 && (
        <Badge variant="outline" className="gap-1 py-1 px-2 border-amber-400">
          <CloudOff size={14} className="text-amber-500" />
          <span className="text-amber-500 ml-1">{pendingItems} pendente{pendingItems !== 1 ? 's' : ''}</span>
        </Badge>
      )}
      
      {showButtons && pendingItems > 0 && connectionStatus === 'connected' && onSyncPending && (
        <Button variant="outline" size="sm" onClick={handleSyncClick} disabled={isPendingSync || isLoading}>
          <CloudOff className={`h-4 w-4 mr-1 ${isPendingSync ? 'animate-pulse' : ''}`} />
          {isPendingSync ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      )}
      
      {showButtons && showRefresh && (
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      )}
    </div>;
};

export default ConnectionStatus;
