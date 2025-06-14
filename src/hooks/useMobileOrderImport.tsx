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
      console.log('🔄 Loading pending mobile orders...');
      
      const orders = await mobileOrderImportService.getPendingMobileOrders();
      setPendingOrders(orders);
      
      const grouped = await mobileOrderImportService.groupOrdersBySalesRep(orders);
      setGroupedOrders(grouped);
      
      console.log('✅ Pending orders loaded successfully');
    } catch (error) {
      console.error('❌ Error loading pending orders:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Não foi possível carregar os pedidos pendentes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadImportHistory = useCallback(async () => {
    try {
      const history = await importReportPersistenceService.getImportHistory();
      setImportHistory(history);
    } catch (error) {
      console.error('❌ Error loading import history:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de importação.",
        variant: "destructive"
      });
    }
  }, []);

  const loadSavedReport = useCallback(async (reportId: string) => {
    try {
      const report = await importReportPersistenceService.getImportReport(reportId);
      if (report) {
        setLastImportReport(report);
        setShowReportModal(true);
      }
    } catch (error) {
      console.error('❌ Error loading saved report:', error);
      toast({
        title: "Erro ao carregar relatório",
        description: "Não foi possível carregar o relatório solicitado.",
        variant: "destructive"
      });
    }
  }, []);

  const fixOrderData = useCallback(async (orderCode: number) => {
    try {
      setIsImporting(true);
      console.log(`🔧 Fixing order #${orderCode}...`);
      
      await mobileOrderImportService.fixOrderMissingData(orderCode);
      
      toast({
        title: "Pedido corrigido",
        description: `Pedido #${orderCode} foi corrigido com sucesso.`,
      });
      
      // Reload data to reflect changes
      await loadImportHistory();
      
    } catch (error) {
      console.error('❌ Error fixing order:', error);
      toast({
        title: "Erro ao corrigir pedido",
        description: `Ocorreu um erro ao corrigir o pedido #${orderCode}.`,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  }, [loadImportHistory]);

  const importSelectedOrders = useCallback(async () => {
    if (selection.selectedOrders.size === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione pelo menos um pedido para importar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      console.log(`📦 Importing ${selection.selectedOrders.size} selected orders...`);
      
      const orderIds = Array.from(selection.selectedOrders);
      
      // Import orders and get report
      const report = await mobileOrderImportService.importOrders(orderIds);
      
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
      
      // Reset selection and reload data
      setSelection({ selectedOrders: new Set(), selectedSalesReps: new Set() });
      await loadPendingOrders();
      await loadImportHistory();
      
    } catch (error) {
      console.error('❌ Error importing orders:', error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os pedidos.",
        variant: "destructive"
      });
    } finally {
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
      console.log(`🚫 Rejecting ${selection.selectedOrders.size} selected orders...`);
      
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
      console.error('❌ Error rejecting orders:', error);
      toast({
        title: "Erro na rejeição",
        description: "Ocorreu um erro ao rejeitar os pedidos.",
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
    await Promise.all([loadPendingOrders(), loadImportHistory()]);
  }, [loadPendingOrders, loadImportHistory]);

  useEffect(() => {
    loadPendingOrders();
    loadImportHistory();
  }, [loadPendingOrders, loadImportHistory]);

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
    fixOrderData,
    lastImportReport,
    showReportModal,
    setShowReportModal,
    loadSavedReport
  };
};
