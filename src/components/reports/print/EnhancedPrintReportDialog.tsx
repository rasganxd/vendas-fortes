
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, BarChart3, TrendingUp, Users } from 'lucide-react';
import { ReportType, ReportFilters } from '@/types/reports';
import { AdvancedReportFilters } from './AdvancedReportFilters';

interface EnhancedPrintReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (reportType: ReportType['id'], filters: ReportFilters, options: any) => void;
  appliedFilters: string[];
  currentFilters: ReportFilters;
}

export const EnhancedPrintReportDialog: React.FC<EnhancedPrintReportDialogProps> = ({
  open,
  onOpenChange,
  onPrint,
  appliedFilters,
  currentFilters
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType['id']>('complete');
  const [filters, setFilters] = useState<ReportFilters>(currentFilters);
  const [reportOptions, setReportOptions] = useState({
    classifyBySupervisor: false,
    hideCategory: false,
    showExchangeCommission: false,
    simplifiedLayout: true
  });

  const reportTypes: ReportType[] = [
    {
      id: 'complete',
      name: 'Relatório Completo',
      description: 'Detalhamento completo de todos os pedidos com todas as informações'
    },
    {
      id: 'basic',
      name: 'Relatório Executivo',
      description: 'Resumo consolidado com métricas principais para gestão'
    },
    {
      id: 'sales-only',
      name: 'Relatório de Vendas',
      description: 'Foco exclusivo nas transações de vendas e valores'
    },
    {
      id: 'products-by-salesrep',
      name: 'Produtos por Vendedor',
      description: 'Análise detalhada de produtos vendidos por cada vendedor'
    }
  ];

  const getIcon = (reportId: ReportType['id']) => {
    switch (reportId) {
      case 'complete': return FileText;
      case 'basic': return BarChart3;
      case 'sales-only': return TrendingUp;
      case 'products-by-salesrep': return Users;
      default: return FileText;
    }
  };

  const handleConfirm = () => {
    onPrint(selectedReport, filters, reportOptions);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configuração Avançada de Relatório</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtros Avançados */}
          <AdvancedReportFilters
            filters={filters}
            onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
            reportOptions={reportOptions}
            onOptionsChange={setReportOptions}
          />

          {/* Seleção do tipo de relatório */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-medium mb-4 block">Tipo de Relatório:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((report) => {
                  const Icon = getIcon(report.id);
                  return (
                    <Card 
                      key={report.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedReport === report.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-lg ${
                            selectedReport === report.id ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon size={24} className={
                              selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
                            } />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1">{report.name}</h3>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Preview dos Filtros Aplicados */}
          {appliedFilters.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <Label className="text-sm font-medium text-blue-800 mb-2 block">
                  Filtros Atuais do Sistema:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.map((filter, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border">
                      {filter}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handleCancel} className="px-6">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="px-6 bg-blue-600 hover:bg-blue-700">
              Confirmar e Gerar Relatório
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
