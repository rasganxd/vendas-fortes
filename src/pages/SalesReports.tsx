
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
        <div className="h-[calc(100vh-200px)] flex gap-4">
          <div className="w-64 flex-shrink-0">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
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
      <div className="h-[calc(100vh-200px)] flex gap-4 overflow-hidden">
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
                className="flex items-center gap-2"
              >
                <Download size={16} />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer size={16} />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Visualizador de relatórios com scroll */}
          <div className="flex-1 overflow-y-auto">
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
