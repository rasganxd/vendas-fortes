
import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ReportsFilterSidebar } from '@/components/reports/ReportsFilterSidebar';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { useSalesReports } from '@/hooks/useSalesReports';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const SalesReports = () => {
  const {
    salesReportData,
    metrics,
    salesRepPerformance,
    topProducts,
    chartData,
    filters,
    updateFilters,
    clearFilters,
    isLoading,
    salesReps,
    customers
  } = useSalesReports();

  const handleExportPDF = () => {
    toast.info('Funcionalidade de exportação PDF será implementada em breve');
  };

  const handleExportExcel = () => {
    toast.info('Funcionalidade de exportação Excel será implementada em breve');
  };

  const handlePrint = () => {
    window.print();
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
        <div className="h-[calc(100vh-160px)] flex gap-3 overflow-hidden">
          <div className="w-60 flex-shrink-0">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Relatórios de Vendas"
      subtitle="Análise detalhada de performance de vendas"
      description="Visualize e analise dados de vendas com filtros avançados"
      showConnectionStatus={false}
      fullWidth={true}
    >
      <div className="h-[calc(100vh-160px)] flex gap-3 overflow-hidden">
        {/* Sidebar de filtros */}
        <div className="w-60 flex-shrink-0">
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
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText size={16} />
              <span>{salesReportData.length} registros encontrados</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 h-8 px-3"
              >
                <Download size={14} />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 h-8 px-3"
              >
                <Download size={14} />
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex items-center gap-1.5 h-8 px-3"
              >
                <Printer size={14} />
                Imprimir
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
              chartData={chartData}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SalesReports;
