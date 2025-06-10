import React, { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ReportsFilterSidebar } from '@/components/reports/ReportsFilterSidebar';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { EnhancedPrintReportDialog } from '@/components/reports/print/EnhancedPrintReportDialog';
import { useSalesReports } from '@/hooks/useSalesReports';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ReportType } from '@/types/reports';
import '../styles/print-reports.css';

const SalesReports = () => {
  const {
    salesReportData,
    metrics,
    salesRepPerformance,
    topProducts,
    filters,
    updateFilters,
    clearFilters,
    isLoading,
    salesReps,
    customers
  } = useSalesReports();

  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const getAppliedFilters = () => {
    const appliedFilters: string[] = [];
    
    if (filters.period) {
      const periodLabels = {
        'today': 'Hoje',
        'week': 'Esta Semana',
        'month': 'Este Mês',
        'quarter': 'Este Trimestre',
        'year': 'Este Ano',
        'custom': 'Período Personalizado'
      };
      appliedFilters.push(`Período: ${periodLabels[filters.period] || filters.period}`);
    }
    
    if (filters.salesRepName) {
      appliedFilters.push(`Vendedor: ${filters.salesRepName}`);
    }
    
    if (filters.customerName) {
      appliedFilters.push(`Cliente: ${filters.customerName}`);
    }
    
    if (filters.orderStatus) {
      appliedFilters.push(`Status: ${filters.orderStatus}`);
    }
    
    if (filters.minValue !== undefined) {
      appliedFilters.push(`Valor Mín: R$ ${filters.minValue.toFixed(2)}`);
    }
    
    if (filters.maxValue !== undefined) {
      appliedFilters.push(`Valor Máx: R$ ${filters.maxValue.toFixed(2)}`);
    }

    return appliedFilters;
  };

  const handleExportPDF = () => {
    toast.info('Funcionalidade de exportação PDF será implementada em breve');
  };

  const handleExportExcel = () => {
    toast.info('Funcionalidade de exportação Excel será implementada em breve');
  };

  const handlePrintReport = () => {
    setShowPrintDialog(true);
  };

  const handleGeneratePrint = (reportType: ReportType['id'], reportFilters: any, options: any) => {
    console.log(`Gerando relatório ${reportType} com configurações avançadas`);
    console.log('Filtros:', reportFilters);
    console.log('Opções:', options);
    toast.success('Relatório configurado! Use Ctrl+P para imprimir.');
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Relatórios de Vendas"
        subtitle="Análise detalhada de performance de vendas"
        description="Visualize e analise dados de vendas com filtros avançados"
        showConnectionStatus={false}
        fullWidth={true}
      >
        <div className="h-[calc(100vh-160px)] flex gap-4 overflow-hidden">
          <div className="w-64 flex-shrink-0">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  const appliedFilters = getAppliedFilters();

  return (
    <PageLayout
      title="Relatórios de Vendas"
      subtitle="Análise detalhada de performance de vendas"
      description="Visualize e analise dados de vendas com filtros avançados"
      showConnectionStatus={false}
      fullWidth={true}
    >
      <div className="h-[calc(100vh-160px)] flex gap-4 overflow-hidden">
        {/* Sidebar de filtros */}
        <div className="w-64 flex-shrink-0">
          <ReportsFilterSidebar
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            salesReps={salesReps}
            customers={customers}
          />
        </div>

        {/* Área principal */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Barra de ações */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText size={16} />
              <span>{salesReportData.length} registros encontrados</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 h-9 px-3"
              >
                <Download size={14} />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 h-9 px-3"
              >
                <Download size={14} />
                Excel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handlePrintReport}
                className="flex items-center gap-1.5 h-9 px-3 bg-blue-600 hover:bg-blue-700"
              >
                <Printer size={14} />
                Configurar Relatório
              </Button>
            </div>
          </div>

          {/* Visualizador de relatórios com scroll */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ReportViewer
              salesReportData={salesReportData}
              metrics={metrics}
              salesRepPerformance={salesRepPerformance}
              topProducts={topProducts}
              appliedFilters={appliedFilters}
              onPrintReport={() => toast.success('Relatório preparado para impressão!')}
            />
          </div>
        </div>
      </div>

      {/* Dialog de configuração avançada de relatório */}
      <EnhancedPrintReportDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        onPrint={handleGeneratePrint}
        appliedFilters={appliedFilters}
        currentFilters={filters}
      />
    </PageLayout>
  );
};

export default SalesReports;
