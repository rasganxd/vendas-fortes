
import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, SortAsc, SortDesc } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { EnhancedReportsFilterSidebar } from '@/components/reports/EnhancedReportsFilterSidebar';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { EnhancedPrintReportDialog } from '@/components/reports/print/EnhancedPrintReportDialog';
import { useSalesReports } from '@/hooks/useSalesReports';
import { useSalesReportsPrint } from '@/hooks/useSalesReportsPrint';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ReportType } from '@/types/reports';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const { printSalesReport, isPrinting } = useSalesReportsPrint();
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getAppliedFilters = () => {
    const appliedFilters: string[] = [];
    
    if (filters.period) {
      const periodLabels = {
        'today': 'Hoje',
        'yesterday': 'Ontem', 
        'week': 'Esta Semana',
        'last_week': 'Semana Passada',
        'month': 'Este Mês',
        'last_month': 'Mês Passado',
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

  // Ordenar dados
  const sortedData = React.useMemo(() => {
    const sorted = [...salesReportData].sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [salesReportData, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
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

  const handleGeneratePrint = async (reportType: ReportType['id'], reportFilters: any, options: any) => {
    await printSalesReport(sortedData, reportType, reportFilters, options);
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
          <div className="w-80 flex-shrink-0">
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
        {/* Sidebar de filtros - responsiva */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <EnhancedReportsFilterSidebar
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            salesReps={salesReps}
            customers={customers}
          />
        </div>

        {/* Botão de filtros mobile */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowMobileFilters(true)}
            className="rounded-full h-12 w-12 shadow-lg"
          >
            <Filter size={20} />
          </Button>
        </div>

        {/* Área principal */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Barra de ações */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{sortedData.length} registros encontrados</span>
              </div>
              {appliedFilters.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {appliedFilters.length} filtros
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Ordenação */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="total">Valor</SelectItem>
                    <SelectItem value="customerName">Cliente</SelectItem>
                    <SelectItem value="salesRepName">Vendedor</SelectItem>
                    <SelectItem value="orderCode">Pedido</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="h-9 px-3"
                >
                  {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </Button>
              </div>

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
                disabled={isPrinting}
                className="flex items-center gap-1.5 h-9 px-3 bg-blue-600 hover:bg-blue-700"
              >
                <Printer size={14} />
                {isPrinting ? 'Preparando...' : 'Imprimir'}
              </Button>
            </div>
          </div>

          {/* Visualizador de relatórios */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ReportViewer
              salesReportData={sortedData}
              metrics={metrics}
              salesRepPerformance={salesRepPerformance}
              topProducts={topProducts}
              appliedFilters={appliedFilters}
              onPrintReport={() => handlePrintReport()}
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
