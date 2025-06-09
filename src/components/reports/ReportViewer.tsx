
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompleteReport } from './reports/CompleteReport';
import { BasicReport } from './reports/BasicReport';
import { SalesOnlyReport } from './reports/SalesOnlyReport';
import { ProductsBySalesRep } from './reports/ProductsBySalesRep';
import { ReportSummaryCards } from './ReportSummaryCards';
import { ReportType, SalesReportData, SalesMetrics, SalesRepPerformance, TopProduct } from '@/types/reports';

interface ReportViewerProps {
  salesReportData: SalesReportData[];
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  salesReportData,
  metrics,
  salesRepPerformance,
  topProducts
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
