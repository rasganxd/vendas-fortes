
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompleteReport } from './reports/CompleteReport';
import { BasicReport } from './reports/BasicReport';
import { SalesOnlyReport } from './reports/SalesOnlyReport';
import { ProductsBySalesRep } from './reports/ProductsBySalesRep';
import { ReportSummaryCards } from './ReportSummaryCards';
import { PrintableCompleteReport } from './print/PrintableCompleteReport';
import { PrintableBasicReport } from './print/PrintableBasicReport';
import { PrintableSalesReport } from './print/PrintableSalesReport';
import { PrintableProductsBySalesRep } from './print/PrintableProductsBySalesRep';
import { EnhancedPrintHeader } from './print/EnhancedPrintHeader';
import { ReportType, SalesReportData, SalesMetrics, SalesRepPerformance, TopProduct, ReportFilters } from '@/types/reports';
import ReactDOM from 'react-dom';

interface ReportViewerProps {
  salesReportData: SalesReportData[];
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
  appliedFilters?: string[];
  onPrintReport?: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  salesReportData,
  metrics,
  salesRepPerformance,
  topProducts,
  appliedFilters = [],
  onPrintReport
}) => {
  const reportTypes: ReportType[] = [
    {
      id: 'complete',
      name: 'Completo',
      description: 'Relatório detalhado com todas as informações'
    },
    {
      id: 'basic',
      name: 'Básico',
      description: 'Resumo executivo consolidado'
    },
    {
      id: 'sales-only',
      name: 'Vendas',
      description: 'Foco nas transações de vendas'
    },
    {
      id: 'products-by-salesrep',
      name: 'Produtos/Vendedor',
      description: 'Análise de produtos por vendedor'
    }
  ];

  const handlePrintReport = (reportType: ReportType['id'], filters?: ReportFilters, options?: any) => {
    // Criar um container temporário para o relatório
    const printContainer = document.createElement('div');
    document.body.appendChild(printContainer);

    // Criar cabeçalho aprimorado
    const enhancedHeader = (
      <EnhancedPrintHeader 
        title={getReportTitle(reportType)}
        appliedFilters={appliedFilters}
        reportOptions={options}
        filters={filters}
      />
    );

    // Renderizar o componente de impressão apropriado
    let printComponent;
    switch (reportType) {
      case 'complete':
        printComponent = (
          <div className="print-container p-8 bg-white text-black">
            {enhancedHeader}
            <div className="mt-6">
              <PrintableCompleteReport 
                data={salesReportData} 
                appliedFilters={appliedFilters}
              />
            </div>
          </div>
        );
        break;
      case 'basic':
        printComponent = (
          <div className="print-container p-8 bg-white text-black">
            {enhancedHeader}
            <div className="mt-6">
              <PrintableBasicReport 
                metrics={metrics}
                salesRepPerformance={salesRepPerformance}
                appliedFilters={appliedFilters}
              />
            </div>
          </div>
        );
        break;
      case 'sales-only':
        printComponent = (
          <div className="print-container p-8 bg-white text-black">
            {enhancedHeader}
            <div className="mt-6">
              <PrintableSalesReport 
                data={salesReportData}
                appliedFilters={appliedFilters}
              />
            </div>
          </div>
        );
        break;
      case 'products-by-salesrep':
        printComponent = (
          <div className="print-container p-8 bg-white text-black">
            {enhancedHeader}
            <div className="mt-6">
              <PrintableProductsBySalesRep 
                salesRepPerformance={salesRepPerformance}
                topProducts={topProducts}
                appliedFilters={appliedFilters}
              />
            </div>
          </div>
        );
        break;
      default:
        printComponent = (
          <div className="print-container p-8 bg-white text-black">
            {enhancedHeader}
            <div className="mt-6">
              <PrintableCompleteReport 
                data={salesReportData} 
                appliedFilters={appliedFilters}
              />
            </div>
          </div>
        );
    }

    // Renderizar o componente
    ReactDOM.render(printComponent, printContainer);

    // Aguardar um momento para garantir que tudo foi renderizado
    setTimeout(() => {
      // Iniciar a impressão
      window.print();
      
      // Limpar o container temporário após a impressão
      setTimeout(() => {
        document.body.removeChild(printContainer);
      }, 1000);
    }, 500);

    // Chamar callback se fornecido
    if (onPrintReport) {
      onPrintReport();
    }
  };

  const getReportTitle = (reportType: ReportType['id']) => {
    switch (reportType) {
      case 'complete': return 'Relatório Completo de Vendas';
      case 'basic': return 'Relatório Executivo de Vendas';
      case 'sales-only': return 'Relatório de Vendas';
      case 'products-by-salesrep': return 'Relatório de Produtos por Vendedor';
      default: return 'Relatório de Vendas';
    }
  };

  return (
    <div className="space-y-4 min-h-0">
      {/* Cards de resumo */}
      <ReportSummaryCards metrics={metrics} />
      
      {/* Relatórios em abas */}
      <Tabs defaultValue="complete" className="space-y-3 min-h-0">
        <TabsList className="grid w-full grid-cols-4 h-9">
          {reportTypes.map((report) => (
            <TabsTrigger 
              key={report.id} 
              value={report.id}
              className="text-sm px-2"
            >
              {report.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="complete" className="space-y-3 mt-3 min-h-0">
          <CompleteReport data={salesReportData} />
        </TabsContent>
        
        <TabsContent value="basic" className="space-y-3 mt-3 min-h-0">
          <BasicReport 
            metrics={metrics} 
            salesRepPerformance={salesRepPerformance} 
          />
        </TabsContent>
        
        <TabsContent value="sales-only" className="space-y-3 mt-3 min-h-0">
          <SalesOnlyReport data={salesReportData} />
        </TabsContent>
        
        <TabsContent value="products-by-salesrep" className="space-y-3 mt-3 min-h-0">
          <ProductsBySalesRep 
            salesRepPerformance={salesRepPerformance}
            topProducts={topProducts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Expor função para abrir o dialog de impressão externamente
export const openPrintDialog = (setShowPrintDialog: (show: boolean) => void) => {
  setShowPrintDialog(true);
};

// Expor função para impressão direta
export const printReport = (
  reportType: ReportType['id'],
  salesReportData: SalesReportData[],
  metrics: SalesMetrics,
  salesRepPerformance: SalesRepPerformance[],
  topProducts: TopProduct[],
  appliedFilters: string[] = [],
  filters?: ReportFilters,
  options?: any
) => {
  const viewer = {
    handlePrintReport: (type: ReportType['id'], f?: ReportFilters, o?: any) => {
      // Implementação da impressão será adicionada aqui
    }
  };
  
  viewer.handlePrintReport(reportType, filters, options);
};
