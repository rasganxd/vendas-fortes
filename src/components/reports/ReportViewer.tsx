
import React from 'react';
import { CardContent } from '@/components/ui/card';
import CompleteReport from './reports/CompleteReport';
import BasicReport from './reports/BasicReport';
import SalesOnlyReport from './reports/SalesOnlyReport';
import ProductsBySalesRep from './reports/ProductsBySalesRep';
import SalesRankingReport from './reports/SalesRankingReport';
import TimeAnalysisReport from './reports/TimeAnalysisReport';
import ReportExportOptions from './ReportExportOptions';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportFilters, ReportsData } from '@/types/reports';

interface ReportViewerProps {
  reportType: string;
  data: ReportsData | null;
  filters: ReportFilters;
  isLoading: boolean;
  onRefresh: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  reportType,
  data,
  filters,
  isLoading,
  onRefresh
}) => {
  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="p-6 text-center text-muted-foreground">
          <p>Nenhum dado encontrado para os filtros selecionados.</p>
        </div>
      );
    }

    console.log(`🔄 [ReportViewer] Rendering report type: ${reportType}`);

    switch (reportType) {
      case 'complete':
        return <CompleteReport data={data} filters={filters} />;
      case 'basic':
        return <BasicReport data={data} filters={filters} />;
      case 'sales-only':
        return <SalesOnlyReport data={data} filters={filters} />;
      case 'products-by-rep':
        return <ProductsBySalesRep data={data} filters={filters} />;
      case 'ranking':
        return <SalesRankingReport data={data} filters={filters} />;
      case 'time-analysis':
        return <TimeAnalysisReport data={data} filters={filters} />;
      default:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <p>Tipo de relatório não encontrado.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Opções de Exportação */}
      <div className="sticky top-0 bg-white border-b px-6 py-3 z-10">
        <ReportExportOptions
          reportType={reportType}
          data={data}
          filters={filters}
          onRefresh={onRefresh}
        />
      </div>

      {/* Conteúdo do Relatório */}
      <CardContent className="p-0">
        {renderReport()}
      </CardContent>
    </div>
  );
};

export default ReportViewer;
