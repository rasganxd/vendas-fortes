
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { mobileOrderImportService } from '@/services/supabase/mobileOrderImportService';
import { toast } from 'sonner';

export const useMobileOrderImport = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [importHistory, setImportHistory] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  // Group pending orders by sales rep
  const ordersBySalesRep = pendingOrders.reduce((acc, order) => {
    const salesRepId = order.salesRepId;
    const salesRepName = order.salesRepName || 'Vendedor não identificado';
    
    if (!acc[salesRepId]) {
      acc[salesRepId] = {
        salesRepId,
        salesRepName,
        orders: []
      };
    }
    
    acc[salesRepId].orders.push(order);
    return acc;
  }, {} as Record<string, { salesRepId: string; salesRepName: string; orders: Order[] }>);

  const loadPendingOrders = async () => {
    try {
      setIsLoading(true);
      const orders = await mobileOrderImportService.getPendingMobileOrders();
      setPendingOrders(orders);
    } catch (error) {
      console.error('Error loading pending orders:', error);
      toast.error('Erro ao carregar pedidos pendentes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadImportHistory = async () => {
    try {
      const history = await mobileOrderImportService.getImportHistory();
      setImportHistory(history);
    } catch (error) {
      console.error('Error loading import history:', error);
      toast.error('Erro ao carregar histórico de importação');
    }
  };

  const importSelectedOrders = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error('Selecione pelo menos um pedido para importar');
      return;
    }

    try {
      setIsImporting(true);
      await mobileOrderImportService.importMobileOrders(selectedOrderIds, 'admin');
      
      toast.success(`${selectedOrderIds.length} pedidos importados com sucesso!`);
      setSelectedOrderIds([]);
      await loadPendingOrders();
      await loadImportHistory();
    } catch (error) {
      console.error('Error importing orders:', error);
      toast.error('Erro ao importar pedidos');
    } finally {
      setIsImporting(false);
    }
  };

  const rejectSelectedOrders = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error('Selecione pelo menos um pedido para rejeitar');
      return;
    }

    try {
      setIsImporting(true);
      await mobileOrderImportService.rejectMobileOrders(selectedOrderIds, 'admin');
      
      toast.success(`${selectedOrderIds.length} pedidos rejeitados!`);
      setSelectedOrderIds([]);
      await loadPendingOrders();
      await loadImportHistory();
    } catch (error) {
      console.error('Error rejecting orders:', error);
      toast.error('Erro ao rejeitar pedidos');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrdersFromSalesRep = (salesRepId: string) => {
    const salesRepOrders = ordersBySalesRep[salesRepId]?.orders || [];
    const salesRepOrderIds = salesRepOrders.map(order => order.id);
    
    const allSelected = salesRepOrderIds.every(id => selectedOrderIds.includes(id));
    
    if (allSelected) {
      // Deselect all from this sales rep
      setSelectedOrderIds(prev => prev.filter(id => !salesRepOrderIds.includes(id)));
    } else {
      // Select all from this sales rep
      setSelectedOrderIds(prev => [...new Set([...prev, ...salesRepOrderIds])]);
    }
  };

  useEffect(() => {
    loadPendingOrders();
    loadImportHistory();
  }, []);

  return {
    pendingOrders,
    importHistory,
    ordersBySalesRep,
    selectedOrderIds,
    isLoading,
    isImporting,
    toggleOrderSelection,
    selectAllOrdersFromSalesRep,
    importSelectedOrders,
    rejectSelectedOrders,
    refreshData: () => {
      loadPendingOrders();
      loadImportHistory();
    }
  };
};
