
import React from 'react';
import { formatDateBR } from '@/lib/format-utils';

interface PrintHeaderProps {
  title: string;
  appliedFilters: string[];
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ title, appliedFilters }) => {
  const currentDate = new Date();

  return (
    <div className="print-header mb-8">
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Vendas</h1>
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <div className="text-sm text-gray-600 mt-2">
          Gerado em: {formatDateBR(currentDate)} às {currentDate.toLocaleTimeString('pt-BR')}
        </div>
      </div>
      
      {appliedFilters.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Filtros Aplicados:</h3>
          <div className="flex flex-wrap gap-2">
            {appliedFilters.map((filter, index) => (
              <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
