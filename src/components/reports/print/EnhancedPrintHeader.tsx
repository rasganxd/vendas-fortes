
import React from 'react';
import { formatDateBR } from '@/lib/format-utils';

interface EnhancedPrintHeaderProps {
  title: string;
  appliedFilters: string[];
  reportOptions?: {
    classifyBySupervisor: boolean;
    hideCategory: boolean;
    showExchangeCommission: boolean;
    simplifiedLayout: boolean;
  };
  filters?: any;
}

export const EnhancedPrintHeader: React.FC<EnhancedPrintHeaderProps> = ({ 
  title, 
  appliedFilters, 
  reportOptions,
  filters 
}) => {
  const currentDate = new Date();

  return (
    <div className="print-header mb-8">
      {/* Cabeçalho Principal */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Vendas</h1>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="text-sm text-gray-700 mt-2">
          Gerado em: {formatDateBR(currentDate)} às {currentDate.toLocaleTimeString('pt-BR')}
        </div>
      </div>
      
      {/* Seção de Filtros Detalhada */}
      <div className="bg-gray-50 border border-gray-300 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2">
          Parâmetros do Relatório
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {/* Filtros Aplicados */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Período:</h4>
            <div className="text-gray-600">
              {filters?.startDate ? formatDateBR(filters.startDate) : 'Não definido'} até{' '}
              {filters?.endDate ? formatDateBR(filters.endDate) : 'Hoje'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Vendedor:</h4>
            <div className="text-gray-600">
              {filters?.salesRepName || 'Todos'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Cliente:</h4>
            <div className="text-gray-600">
              {filters?.customerName || 'Todos'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Status:</h4>
            <div className="text-gray-600">
              {filters?.orderStatus || 'Todos'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Valor Mínimo:</h4>
            <div className="text-gray-600">
              {filters?.minValue ? `R$ ${filters.minValue.toFixed(2)}` : 'Não definido'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Valor Máximo:</h4>
            <div className="text-gray-600">
              {filters?.maxValue ? `R$ ${filters.maxValue.toFixed(2)}` : 'Não definido'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Listagem:</h4>
            <div className="text-gray-600">Vendas</div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Fator Conversão:</h4>
            <div className="text-gray-600">1,000000</div>
          </div>
        </div>

        {/* Opções do Relatório */}
        {reportOptions && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-3">Configurações Aplicadas:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded border ${reportOptions.classifyBySupervisor ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}></span>
                <span className="text-gray-600">Classificar por supervisor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded border ${reportOptions.hideCategory ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}></span>
                <span className="text-gray-600">Não listar categoria</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded border ${reportOptions.showExchangeCommission ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}></span>
                <span className="text-gray-600">Listar Comissão das Trocas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded border ${reportOptions.simplifiedLayout ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}></span>
                <span className="text-gray-600">Layout Simplificado</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resumo dos Filtros Ativos */}
      {appliedFilters.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Filtros Ativos no Sistema:</h4>
          <div className="flex flex-wrap gap-2">
            {appliedFilters.map((filter, index) => (
              <span key={index} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded border">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
