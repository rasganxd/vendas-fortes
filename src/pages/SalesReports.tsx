
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportsFilterSidebar from '@/components/reports/ReportsFilterSidebar';
import ReportViewer from '@/components/reports/ReportViewer';
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import { useSalesReports } from '@/hooks/useSalesReports';
import { useReportFilters } from '@/hooks/useReportFilters';

const SalesReports = () => {
  const [activeReportType, setActiveReportType] = useState('complete');
  
  const {
    filters,
    updateFilter,
    resetFilters,
    appliedFilters
  } = useReportFilters();

  const {
    reportsData,
    isLoading,
    summaryData,
    refreshReports
  } = useSalesReports(appliedFilters);

  const reportTypes = [
    { id: 'complete', label: 'Relatório Completo', description: 'Análise detalhada com todos os dados' },
    { id: 'basic', label: 'Relatório Básico', description: 'Resumo simplificado das vendas' },
    { id: 'sales-only', label: 'Somente Vendas', description: 'Foco nas transações de vendas' },
    { id: 'products-by-rep', label: 'Produtos por Vendedor', description: 'Performance de produtos por vendedor' },
    { id: 'ranking', label: 'Ranking de Vendedores', description: 'Comparativo de performance' },
    { id: 'time-analysis', label: 'Análise Temporal', description: 'Tendências ao longo do tempo' }
  ];

  console.log('🔄 [SalesReports] Rendering with:', {
    activeReportType,
    filtersApplied: Object.keys(appliedFilters).length,
    hasData: !!reportsData,
    isLoading
  });

  return (
    <PageLayout 
      title="Relatórios de Vendas" 
      subtitle="Análise completa de performance e vendas"
    >
      <div className="flex gap-6 h-full">
        {/* Sidebar de Filtros */}
        <div className="w-80 flex-shrink-0">
          <ReportsFilterSidebar
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={resetFilters}
            appliedFilters={appliedFilters}
          />
        </div>

        {/* Área Principal de Relatórios */}
        <div className="flex-1 space-y-6">
          {/* Cards de Resumo */}
          <ReportSummaryCards 
            summaryData={summaryData}
            isLoading={isLoading}
          />

          {/* Tabs de Tipos de Relatório */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeReportType} onValueChange={setActiveReportType}>
                <div className="border-b px-6 py-4">
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    {reportTypes.map(type => (
                      <TabsTrigger 
                        key={type.id} 
                        value={type.id}
                        className="text-xs"
                      >
                        {type.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {reportTypes.map(type => (
                  <TabsContent key={type.id} value={type.id} className="m-0">
                    <ReportViewer
                      reportType={type.id}
                      data={reportsData}
                      filters={appliedFilters}
                      isLoading={isLoading}
                      onRefresh={refreshReports}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SalesReports;
