
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, BarChart3, TrendingUp, Users } from 'lucide-react';
import { ReportType } from '@/types/reports';

interface PrintReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (reportType: ReportType['id']) => void;
  appliedFilters: string[];
}

export const PrintReportDialog: React.FC<PrintReportDialogProps> = ({
  open,
  onOpenChange,
  onPrint,
  appliedFilters
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType['id']>('complete');

  const reportTypes: ReportType[] = [
    {
      id: 'complete',
      name: 'Relatório Completo',
      description: 'Detalhamento completo de todos os pedidos com todas as informações'
    },
    {
      id: 'basic',
      name: 'Relatório Básico',
      description: 'Resumo executivo consolidado com métricas principais'
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

  const handlePrint = () => {
    onPrint(selectedReport);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Relatório para Impressão</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtros aplicados */}
          {appliedFilters.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label className="text-sm font-medium text-blue-800">Filtros que serão aplicados:</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {appliedFilters.map((filter, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seleção do tipo de relatório */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selecione o tipo de relatório:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportTypes.map((report) => {
                const Icon = getIcon(report.id);
                return (
                  <Card 
                    key={report.id}
                    className={`cursor-pointer transition-all ${
                      selectedReport === report.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedReport === report.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon size={20} className={
                            selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{report.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePrint}>
              Gerar e Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
