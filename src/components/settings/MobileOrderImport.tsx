
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Smartphone, Import, History, FileText } from "lucide-react";
import { useMobileOrderImport } from '@/hooks/useMobileOrderImport';
import { MobileOrderImportTable } from './MobileOrderImportTable';
import { ImportControlPanel } from './ImportControlPanel';
import { ImportHistoryGroupedTable } from './ImportHistoryGroupedTable';
import MobileImportReportModal from '@/components/reports/MobileImportReportModal';

export default function MobileOrderImport() {
  const {
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
  } = useMobileOrderImport();

  const totalPendingValue = groupedOrders.reduce((sum, group) => sum + group.totalValue, 0);
  const totalPendingCount = pendingOrders.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Importar Pedidos Mobile</CardTitle>
                <CardDescription>
                  Gerencie a importação manual de pedidos enviados pelos vendedores via mobile
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {lastImportReport && (
                <Button 
                  variant="outline"
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Último Relatório
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Import className="h-4 w-4" />
                Pedidos Pendentes ({totalPendingCount})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico de Importações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              <ImportControlPanel
                selectedCount={selection.selectedOrders.size}
                totalCount={totalPendingCount}
                totalValue={totalPendingValue}
                isImporting={isImporting}
                onImportSelected={importSelectedOrders}
                onRejectSelected={rejectSelectedOrders}
                onSelectAll={selectAllOrders}
                onClearSelection={clearSelection}
                onRefresh={refreshData}
              />

              <MobileOrderImportTable
                groupedOrders={groupedOrders}
                selectedOrders={selection.selectedOrders}
                selectedSalesReps={selection.selectedSalesReps}
                isLoading={isLoading}
                onToggleOrder={toggleOrderSelection}
                onToggleSalesRep={toggleSalesRepSelection}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ImportHistoryGroupedTable
                importHistory={importHistory}
                isLoading={isLoading}
                onViewReport={loadSavedReport}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <MobileImportReportModal
        report={lastImportReport}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}
