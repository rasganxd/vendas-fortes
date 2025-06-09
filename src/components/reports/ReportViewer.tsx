
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompleteReport } from './reports/CompleteReport';
import { BasicReport } from './reports/BasicReport';
import { SalesOnlyReport } from './reports/SalesOnlyReport';
import { ProductsBySalesRep } from './reports/ProductsBySalesRep';
import { SalesChartsCollection } from './SalesChartsCollection';
import { ReportSummaryCards } from './ReportSummaryCards';
import { ReportType, SalesReportData, SalesMetrics, SalesRepPerformance, TopProduct, ChartData } from '@/types/reports';

interface ReportViewerProps {
  salesReportData: SalesReportData[];
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
  chartData: ChartData[];
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  salesReportData,
  metrics,
  salesRepPerformance,
  topProducts,
  chartData
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
      name: 'Somente Vendas',
      description: 'Foco nas transações de vendas'
    },
    {
      id: 'products-by-salesrep',
      name: 'Produtos por Vendedor',
      description: 'Análise de produtos vendidos por vendedor'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <ReportSummaryCards metrics={metrics} />
      
      {/* Gráficos */}
      <SalesChartsCollection 
        chartData={chartData}
        salesRepPerformance={salesRepPerformance}
        topProducts={topProducts}
      />
      
      {/* Relatórios em abas */}
      <Tabs defaultValue="complete" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {reportTypes.map((report) => (
            <TabsTrigger 
              key={report.id} 
              value={report.id}
              className="text-sm"
            >
              {report.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="complete" className="space-y-4">
          <CompleteReport data={salesReportData} />
        </TabsContent>
        
        <TabsContent value="basic" className="space-y-4">
          <BasicReport 
            metrics={metrics} 
            salesRepPerformance={salesRepPerformance} 
          />
        </TabsContent>
        
        <TabsContent value="sales-only" className="space-y-4">
          <SalesOnlyReport data={salesReportData} />
        </TabsContent>
        
        <TabsContent value="products-by-salesrep" className="space-y-4">
          <ProductsBySalesRep 
            salesRepPerformance={salesRepPerformance}
            topProducts={topProducts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
