
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, RefreshCw, FileText, Table, Image } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ReportFilters, ReportsData } from '@/types/reports';
import { useReportExport } from '@/hooks/useReportExport';

interface ReportExportOptionsProps {
  reportType: string;
  data: ReportsData | null;
  filters: ReportFilters;
  onRefresh: () => void;
}

const ReportExportOptions: React.FC<ReportExportOptionsProps> = ({
  reportType,
  data,
  filters,
  onRefresh
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportToPDF, exportToExcel, exportToCSV, exportChartAsImage } = useReportExport();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'image') => {
    if (!data) {
      toast({
        title: "Erro",
        description: "Nenhum dado disponível para exportar.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      console.log(`📤 [ReportExportOptions] Exporting ${reportType} as ${format}`);
      
      switch (format) {
        case 'pdf':
          await exportToPDF(reportType, data, filters);
          break;
        case 'excel':
          await exportToExcel(reportType, data, filters);
          break;
        case 'csv':
          await exportToCSV(reportType, data, filters);
          break;
        case 'image':
          await exportChartAsImage(reportType, data);
          break;
      }
      
      toast({
        title: "Export concluído",
        description: `Relatório exportado como ${format.toUpperCase()} com sucesso!`
      });
    } catch (error) {
      console.error(`❌ [ReportExportOptions] Error exporting as ${format}:`, error);
      toast({
        title: "Erro no export",
        description: "Ocorreu um erro ao exportar o relatório.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">
          {getReportTitle(reportType)}
        </h3>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isExporting || !data}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar como PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <Table className="h-4 w-4 mr-2" />
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Table className="h-4 w-4 mr-2" />
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('image')}>
              <Image className="h-4 w-4 mr-2" />
              Exportar Gráficos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const getReportTitle = (reportType: string): string => {
  const titles = {
    'complete': 'Relatório Completo',
    'basic': 'Relatório Básico',
    'sales-only': 'Somente Vendas',
    'products-by-rep': 'Produtos por Vendedor',
    'ranking': 'Ranking de Vendedores',
    'time-analysis': 'Análise Temporal'
  };
  return titles[reportType] || 'Relatório';
};

export default ReportExportOptions;
