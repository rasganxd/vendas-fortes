
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompleteReport } from './reports/CompleteReport';
import { BasicReport } from './reports/BasicReport';
import { SalesOnlyReport } from './reports/SalesOnlyReport';
import { ProductsBySalesRep } from './reports/ProductsBySalesRep';
import { ReportSummaryCards } from './ReportSummaryCards';
import { PrintReportDialog } from './PrintReportDialog';
import { PrintableCompleteReport } from './print/PrintableCompleteReport';
import { PrintableBasicReport } from './print/PrintableBasicReport';
import { PrintableSalesReport } from './print/PrintableSalesReport';
import { PrintableProductsBySalesRep } from './print/PrintableProductsBySalesRep';
import { ReportType, SalesReportData, SalesMetrics, SalesRepPerformance, TopProduct } from '@/types/reports';
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
  const [showPrintDialog, setShowPrintDialog] = useState(false);

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

  const handlePrintReport = (reportType: ReportType['id']) => {
    // Criar um container temporário para o relatório
    const printContainer = document.createElement('div');
    document.body.appendChild(printContainer);

    // Renderizar o componente de impressão apropriado
    let printComponent;
    switch (reportType) {
      case 'complete':
        printComponent = (
          <PrintableCompleteReport 
            data={salesReportData} 
            appliedFilters={appliedFilters}
          />
        );
        break;
      case 'basic':
        printComponent = (
          <PrintableBasicReport 
            metrics={metrics}
            salesRepPerformance={salesRepPerformance}
            appliedFilters={appliedFilters}
          />
        );
        break;
      case 'sales-only':
        printComponent = (
          <PrintableSalesReport 
            data={salesReportData}
            appliedFilters={appliedFilters}
          />
        );
        break;
      case 'products-by-salesrep':
        printComponent = (
          <PrintableProductsBySalesRep 
            salesRepPerformance={salesRepPerformance}
            topProducts={topProducts}
            appliedFilters={appliedFilters}
          />
        );
        break;
      default:
        printComponent = (
          <PrintableCompleteReport 
            data={salesReportData} 
            appliedFilters={appliedFilters}
          />
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

      {/* Dialog de impressão */}
      <PrintReportDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        onPrint={handlePrintReport}
        appliedFilters={appliedFilters}
      />
    </div>
  );
};

// Expor função para abrir o dialog de impressão externamente
export const openPrintDialog = (setShowPrintDialog: (show: boolean) => void) => {
  setShowPrintDialog(true);
};
