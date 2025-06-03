
import { useState, useEffect, useCallback } from 'react';
import { LocalServerStatus, SalesRepSyncStatus, SyncLog, DadosVendedor } from '@/types/localSync';
import { localSyncService } from '@/services/localSyncService';
import { toast } from '@/components/ui/use-toast';

export const useLocalSyncServer = () => {
  const [serverStatus, setServerStatus] = useState<LocalServerStatus>({
    isRunning: false,
    port: 3000,
    localIP: '192.168.1.100',
    connectedDevices: 0,
    totalRequests: 0,
    lastActivity: null
  });
  
  const [salesRepStatus, setSalesRepStatus] = useState<SalesRepSyncStatus[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initializeServer = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🚀 [useLocalSyncServer] Inicializando servidor...');
      
      await localSyncService.initializeServer();
      updateServerStatus();
      
      toast({
        title: "✅ Servidor iniciado",
        description: "Servidor de sincronização local está ativo"
      });
    } catch (error) {
      console.error('❌ [useLocalSyncServer] Erro ao inicializar servidor:', error);
      toast({
        title: "❌ Erro ao iniciar servidor",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateServerStatus = useCallback(() => {
    const status = localSyncService.getServerStatus();
    setServerStatus(status);
  }, []);

  const refreshSalesRepStatus = useCallback(async () => {
    try {
      console.log('🔄 [useLocalSyncServer] Atualizando status dos vendedores...');
      const status = await localSyncService.getSalesRepSyncStatus();
      setSalesRepStatus(status);
    } catch (error) {
      console.error('❌ [useLocalSyncServer] Erro ao atualizar status:', error);
    }
  }, []);

  const refreshSyncLogs = useCallback(() => {
    const logs = localSyncService.getSyncLogs();
    setSyncLogs(logs);
  }, []);

  const generateSalesRepData = useCallback(async (codigo: number): Promise<DadosVendedor | null> => {
    try {
      console.log(`📦 [useLocalSyncServer] Gerando dados para vendedor ${codigo}...`);
      
      const data = await localSyncService.generateSalesRepData(codigo);
      
      if (data) {
        toast({
          title: "✅ Dados gerados",
          description: `Pacote de dados criado para ${data.vendedor.nome}`
        });
        
        // Atualizar logs e status
        refreshSyncLogs();
        updateServerStatus();
      } else {
        toast({
          title: "❌ Erro ao gerar dados",
          description: `Vendedor ${codigo} não encontrado`,
          variant: "destructive"
        });
      }
      
      return data;
    } catch (error) {
      console.error('❌ [useLocalSyncServer] Erro ao gerar dados:', error);
      toast({
        title: "❌ Erro ao gerar dados",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
    }
  }, [refreshSyncLogs, updateServerStatus]);

  const clearLogs = useCallback(() => {
    localSyncService.clearSyncLogs();
    refreshSyncLogs();
    
    toast({
      title: "🗑️ Logs limpos",
      description: "Histórico de sincronização foi limpo"
    });
  }, [refreshSyncLogs]);

  // Auto-refresh dos dados a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      updateServerStatus();
      refreshSalesRepStatus();
      refreshSyncLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [updateServerStatus, refreshSalesRepStatus, refreshSyncLogs]);

  // Carregamento inicial
  useEffect(() => {
    refreshSalesRepStatus();
    refreshSyncLogs();
    updateServerStatus();
  }, [refreshSalesRepStatus, refreshSyncLogs, updateServerStatus]);

  return {
    serverStatus,
    salesRepStatus,
    syncLogs,
    isLoading,
    initializeServer,
    updateServerStatus,
    refreshSalesRepStatus,
    refreshSyncLogs,
    generateSalesRepData,
    clearLogs
  };
};
