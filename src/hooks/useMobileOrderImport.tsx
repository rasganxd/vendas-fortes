import { useState, useEffect, useCallback } from 'react';
import { Order, MobileOrderGroup, ImportSelectionState } from '@/types';
import { ImportHistoryRecord } from '@/types/importHistory';
import { mobileOrderImportService } from '@/services/supabase/mobileOrderImportService';
import { importReportPersistenceService } from '@/services/supabase/importReportPersistenceService';
import { ImportReportData } from '@/services/mobileImportReportService';
import { toast } from '@/hooks/use-toast';

export const useMobileOrderImport = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<MobileOrderGroup[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selection, setSelection] = useState<ImportSelectionState>({
    selectedOrders: new Set(),
    selectedSalesReps: new Set()
  });

  // New state for reports
  const [lastImportReport, setLastImportReport] = useState<ImportReportData | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const loadPendingOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [useMobileOrderImport] Loading pending mobile orders...');
      
      const orders = await mobileOrderImportService.getPendingMobileOrders();
      console.log(`📊 [useMobileOrderImport] Received ${orders.length} pending orders`);
      
      setPendingOrders(orders);
      
      if (orders.length > 0) {
        const grouped = await mobileOrderImportService.groupOrdersBySalesRep(orders);
        console.log(`📊 [useMobileOrderImport] Created ${grouped.length} sales rep groups`);
        setGroupedOrders(grouped);
      } else {
        setGroupedOrders([]);
      }
      
      console.log('✅ [useMobileOrderImport] Pending orders loaded successfully');
    } catch (error) {
      console.error('❌ [useMobileOrderImport] Error loading pending orders:', error);
      
      // Set empty states on error
      setPendingOrders([]);
      setGroupedOrders([]);
      
      toast({
        title: "Erro ao carregar pedidos",
        description: `Não foi possível carregar os pedidos pendentes: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadImportHistory = useCallback(async () => {
    try {
      console.log('📊 [useMobileOrderImport] Loading import history...');
      const history = await importReportPersistenceService.getImportHistory();
      console.log(`📊 [useMobileOrderImport] Loaded ${history.length} import history records`);
      setImportHistory(history);
    } catch (error) {
      console.error('❌ [useMobileOrderImport] Error loading import history:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de importação.",
        variant: "destructive"
      });
    }
  }, []);

  const loadSavedReport = useCallback(async (reportId: string) => {
    try {
      console.log(`📊 [useMobileOrderImport] Loading saved report: ${reportId}`);
      const report = await importReportPersistenceService.getImportReport(reportId);
      if (report) {
        setLastImportReport(report);
        setShowReportModal(true);
      }
    } catch (error) {
      console.error('❌ [useMobileOrderImport] Error loading saved report:', error);
      toast({
        title: "Erro ao carregar relatório",
        description: "Não foi possível carregar o relatório solicitado.",
        variant: "destructive"
      });
    }
  }, []);

  const importSelectedOrders = useCallback(async () => {
    if (selection.selectedOrders.size === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione pelo menos um pedido para importar.",
        variant: "destructive"
      });
      return;
    }

    console.log('[useMobileOrderImport] Starting import process...');
    try {
      setIsImporting(true);
      console.log(`[useMobileOrderImport] 📦 Importing ${selection.selectedOrders.size} selected orders...`);
      
      const orderIds = Array.from(selection.selectedOrders);
      console.log('[useMobileOrderImport] Order IDs to import:', orderIds);
      
      // Import orders and get report
      const report = await mobileOrderImportService.importOrders(orderIds);
      console.log('[useMobileOrderImport] ✅ Import successful, report generated.');
      
      setLastImportReport(report);
      
      toast({
        title: "Pedidos importados",
        description: `${orderIds.length} pedidos foram importados com sucesso.`,
        action: (
          <button onClick={() => setShowReportModal(true)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
            Ver Relatório
          </button>
        )
      });
      
      console.log('[useMobileOrderImport] Resetting selection and reloading data...');
      // Reset selection and reload data
      setSelection({ selectedOrders: new Set(), selectedSalesReps: new Set() });
      await loadPendingOrders();
      await loadImportHistory();
      console.log('[useMobileOrderImport] Data reloaded.');
      
    } catch (error) {
      console.error('❌ [useMobileOrderImport] Error importing orders:', error);
      toast({
        title: "Erro na importação",
        description: `Ocorreu um erro ao importar os pedidos: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      console.log('[useMobileOrderImport] Import process finished.');
      setIsImporting(false);
    }
  }, [selection.selectedOrders, loadPendingOrders, loadImportHistory]);

  const rejectSelectedOrders = useCallback(async () => {
    if (selection.selectedOrders.size === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione pelo menos um pedido para rejeitar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      console.log(`🚫 [useMobileOrderImport] Rejecting ${selection.selectedOrders.size} selected orders...`);
      
      const orderIds = Array.from(selection.selectedOrders);
      
      // Reject orders and get report
      const report = await mobileOrderImportService.rejectOrders(orderIds);
      
      setLastImportReport(report);
      
      toast({
        title: "Pedidos rejeitados",
        description: `${orderIds.length} pedidos foram rejeitados.`,
        action: (
          <button onClick={() => setShowReportModal(true)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
            Ver Relatório
          </button>
        )
      });
      
      // Reset selection and reload data
      setSelection({ selectedOrders: new Set(), selectedSalesReps: new Set() });
      await loadPendingOrders();
      await loadImportHistory();
      
    } catch (error) {
      console.error('❌ [useMobileOrderImport] Error rejecting orders:', error);
      toast({
        title: "Erro na rejeição",
        description: `Ocorreu um erro ao rejeitar os pedidos: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  }, [selection.selectedOrders, loadPendingOrders, loadImportHistory]);

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelection(prev => {
      const newSelected = new Set(prev.selectedOrders);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return { ...prev, selectedOrders: newSelected };
    });
  }, []);

  const toggleSalesRepSelection = useCallback((salesRepId: string) => {
    setSelection(prev => {
      const newSelectedSalesReps = new Set(prev.selectedSalesReps);
      const newSelectedOrders = new Set(prev.selectedOrders);
      
      if (newSelectedSalesReps.has(salesRepId)) {
        // Unselect sales rep and all their orders
        newSelectedSalesReps.delete(salesRepId);
        const salesRepOrders = groupedOrders.find(g => g.salesRepId === salesRepId)?.orders || [];
        salesRepOrders.forEach(order => newSelectedOrders.delete(order.id));
      } else {
        // Select sales rep and all their orders
        newSelectedSalesReps.add(salesRepId);
        const salesRepOrders = groupedOrders.find(g => g.salesRepId === salesRepId)?.orders || [];
        salesRepOrders.forEach(order => newSelectedOrders.add(order.id));
      }
      
      return { selectedOrders: newSelectedOrders, selectedSalesReps: newSelectedSalesReps };
    });
  }, [groupedOrders]);

  const selectAllOrders = useCallback(() => {
    const allOrderIds = pendingOrders.map(order => order.id);
    const allSalesRepIds = groupedOrders.map(group => group.salesRepId);
    setSelection({
      selectedOrders: new Set(allOrderIds),
      selectedSalesReps: new Set(allSalesRepIds)
    });
  }, [pendingOrders, groupedOrders]);

  const clearSelection = useCallback(() => {
    setSelection({ selectedOrders: new Set(), selectedSalesReps: new Set() });
  }, []);

  const refreshData = useCallback(async () => {
    console.log('🔄 [useMobileOrderImport] Refreshing all data...');
    await Promise.all([loadPendingOrders(), loadImportHistory()]);
    console.log('✅ [useMobileOrderImport] All data refreshed');
  }, [loadPendingOrders, loadImportHistory]);

  useEffect(() => {
    console.log('🚀 [useMobileOrderImport] Component mounted, loading initial data...');
    loadPendingOrders();
    loadImportHistory();
  }, [loadPendingOrders, loadImportHistory]);

  // Debug log when states change
  useEffect(() => {
    console.log('📊 [useMobileOrderImport] State update:', {
      pendingOrdersCount: pendingOrders.length,
      groupedOrdersCount: groupedOrders.length,
      isLoading,
      selectedOrdersCount: selection.selectedOrders.size,
      selectedSalesRepsCount: selection.selectedSalesReps.size
    });
  }, [pendingOrders, groupedOrders, isLoading, selection]);

  return {
    pendingOrders,
    groupedOrders,
    importHistory,
    isLoading,
    isImporting,
    selection,
    importSelectedOrders,
    rejectSelectedOrders,
    toggleOrderSelection,
    toggleSalesRepSelection,
    selectAllOrders,
    clearSelection,
    refreshData,
    lastImportReport,
    showReportModal,
    setShowReportModal,
    loadSavedReport
  };
};
