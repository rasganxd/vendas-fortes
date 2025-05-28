
import { useState, useEffect, useCallback } from 'react';
import { mobileOrderService, MobileOrder, ImportResult, SalesRepSyncStatus } from '@/services/supabase/mobileOrderService';
import { toast } from 'sonner';

export const useMobileOrders = () => {
  const [pendingOrders, setPendingOrders] = useState<MobileOrder[]>([]);
  const [importedOrders, setImportedOrders] = useState<MobileOrder[]>([]);
  const [syncStatus, setSyncStatus] = useState<SalesRepSyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Carregar pedidos pendentes
  const loadPendingOrders = useCallback(async (salesRepId?: string) => {
    try {
      setIsLoading(true);
      const orders = await mobileOrderService.getPendingOrders(salesRepId);
      setPendingOrders(orders);
    } catch (error) {
      console.error('Error loading pending orders:', error);
      toast.error('Erro ao carregar pedidos pendentes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar pedidos importados
  const loadImportedOrders = useCallback(async (salesRepId?: string) => {
    try {
      setIsLoading(true);
      const orders = await mobileOrderService.getImportedOrders(salesRepId);
      setImportedOrders(orders);
    } catch (error) {
      console.error('Error loading imported orders:', error);
      toast.error('Erro ao carregar pedidos importados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar status de sincronização
  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await mobileOrderService.getSalesRepSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
      toast.error('Erro ao carregar status de sincronização');
    }
  }, []);

  // Importar pedidos
  const importOrders = useCallback(async (salesRepId?: string): Promise<ImportResult> => {
    try {
      setIsImporting(true);
      const result = await mobileOrderService.importOrders(salesRepId);
      
      if (result.imported_count > 0) {
        toast.success(`${result.imported_count} pedido(s) importado(s) com sucesso!`);
      }
      
      if (result.failed_count > 0) {
        toast.warning(`${result.failed_count} pedido(s) falharam na importação`);
      }

      // Recarregar dados
      await Promise.all([
        loadPendingOrders(salesRepId),
        loadImportedOrders(salesRepId),
        loadSyncStatus()
      ]);

      return result;
    } catch (error) {
      console.error('Error importing orders:', error);
      toast.error('Erro ao importar pedidos');
      return { imported_count: 0, failed_count: 0, error_messages: [] };
    } finally {
      setIsImporting(false);
    }
  }, [loadPendingOrders, loadImportedOrders, loadSyncStatus]);

  // Reimportar pedido específico
  const reimportOrder = useCallback(async (mobileOrderId: string) => {
    try {
      setIsImporting(true);
      await mobileOrderService.reimportOrder(mobileOrderId);
      toast.success('Pedido reimportado com sucesso!');
      
      // Recarregar dados
      await Promise.all([
        loadPendingOrders(),
        loadImportedOrders(),
        loadSyncStatus()
      ]);
    } catch (error) {
      console.error('Error reimporting order:', error);
      toast.error('Erro ao reimportar pedido');
    } finally {
      setIsImporting(false);
    }
  }, [loadPendingOrders, loadImportedOrders, loadSyncStatus]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadSyncStatus();
  }, [loadSyncStatus]);

  // Listener para atualizações
  useEffect(() => {
    const handleMobileOrdersUpdate = () => {
      loadPendingOrders();
      loadImportedOrders();
      loadSyncStatus();
    };

    window.addEventListener('mobileOrdersUpdated', handleMobileOrdersUpdate);
    
    return () => {
      window.removeEventListener('mobileOrdersUpdated', handleMobileOrdersUpdate);
    };
  }, [loadPendingOrders, loadImportedOrders, loadSyncStatus]);

  return {
    pendingOrders,
    importedOrders,
    syncStatus,
    isLoading,
    isImporting,
    loadPendingOrders,
    loadImportedOrders,
    loadSyncStatus,
    importOrders,
    reimportOrder
  };
};
