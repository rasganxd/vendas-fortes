import { useState, useEffect, useCallback } from 'react';
import { Order, MobileOrderGroup, ImportSelectionState } from '@/types';
import { mobileOrderImportService } from '@/services/supabase/mobileOrderImportService';
import { mobileImportReportService, ImportReportData } from '@/services/mobileImportReportService';
import { toast } from '@/hooks/use-toast';

export const useMobileOrderImport = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<MobileOrderGroup[]>([]);
  const [importHistory, setImportHistory] = useState<Order[]>([]);
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
      const history = await mobileOrderImportService.getImportHistory();
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
      
      // Get the selected orders for the report
      const selectedOrdersData = pendingOrders.filter(order => orderIds.includes(order.id));
      
      // Import orders
      await mobileOrderImportService.importOrders(orderIds);
      
      // Generate import report
      const report = mobileImportReportService.generateImportReport(
        selectedOrdersData,
        'import',
        'admin'
      );
      
      setLastImportReport(report);
      
      toast({
        title: "Pedidos importados",
        description: `${orderIds.length} pedidos foram importados com sucesso.`,
        action: {
          label: "Ver Relatório",
          onClick: () => setShowReportModal(true)
        }
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
  }, [selection.selectedOrders, pendingOrders, loadPendingOrders, loadImportHistory]);

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
      
      // Get the selected orders for the report
      const selectedOrdersData = pendingOrders.filter(order => orderIds.includes(order.id));
      
      // Reject orders
      await mobileOrderImportService.rejectOrders(orderIds);
      
      // Generate rejection report
      const report = mobileImportReportService.generateImportReport(
        selectedOrdersData,
        'reject',
        'admin'
      );
      
      setLastImportReport(report);
      
      toast({
        title: "Pedidos rejeitados",
        description: `${orderIds.length} pedidos foram rejeitados.`,
        action: {
          label: "Ver Relatório",
          onClick: () => setShowReportModal(true)
        }
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
  }, [selection.selectedOrders, pendingOrders, loadPendingOrders, loadImportHistory]);

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
    refreshData: () => {
      loadPendingOrders();
      loadImportHistory();
    },
    // New report-related returns
    lastImportReport,
    showReportModal,
    setShowReportModal
  };
};
