
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ReportFilters } from '@/types/reports';

interface AdvancedReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  reportOptions: {
    classifyBySupervisor: boolean;
    hideCategory: boolean;
    showExchangeCommission: boolean;
    simplifiedLayout: boolean;
  };
  onOptionsChange: (options: any) => void;
}

export const AdvancedReportFilters: React.FC<AdvancedReportFiltersProps> = ({
  filters,
  onFiltersChange,
  reportOptions,
  onOptionsChange
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Filtros e Configurações do Relatório</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Listagem</Label>
            <Select value="vendas" onValueChange={() => {}}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tipo de listagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="produtos">Produtos</SelectItem>
                <SelectItem value="clientes">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Vendedor</Label>
            <Input
              placeholder="Nome do vendedor"
              value={filters.salesRepName || ''}
              onChange={(e) => onFiltersChange({ salesRepName: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Rota</Label>
            <Input
              placeholder="Código ou nome da rota"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Fornecedor</Label>
            <Input
              placeholder="Nome do fornecedor"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Grupo</Label>
            <Input
              placeholder="Grupo de produtos"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria</Label>
            <Input
              placeholder="Categoria de produtos"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Marca</Label>
            <Input
              placeholder="Marca dos produtos"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Fator de Conversão</Label>
            <Select defaultValue="1">
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1,000000</SelectItem>
                <SelectItem value="0.5">0,500000</SelectItem>
                <SelectItem value="2">2,000000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Período */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Inicial</Label>
            <Input
              type="date"
              className="h-9"
              value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => onFiltersChange({ 
                startDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Final</Label>
            <Input
              type="date"
              className="h-9"
              value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => onFiltersChange({ 
                endDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
            />
          </div>
        </div>

        {/* Opções do Relatório */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Opções do Relatório</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="classifyBySupervisor"
                checked={reportOptions.classifyBySupervisor}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...reportOptions, classifyBySupervisor: checked })
                }
              />
              <Label htmlFor="classifyBySupervisor" className="text-sm">
                Classificar por supervisor
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hideCategory"
                checked={reportOptions.hideCategory}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...reportOptions, hideCategory: checked })
                }
              />
              <Label htmlFor="hideCategory" className="text-sm">
                Não listar categoria
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showExchangeCommission"
                checked={reportOptions.showExchangeCommission}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...reportOptions, showExchangeCommission: checked })
                }
              />
              <Label htmlFor="showExchangeCommission" className="text-sm">
                Listar Comissão das Trocas
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="simplifiedLayout"
                checked={reportOptions.simplifiedLayout}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...reportOptions, simplifiedLayout: checked })
                }
              />
              <Label htmlFor="simplifiedLayout" className="text-sm">
                Layout Simplificado
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
