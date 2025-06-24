
import React from 'react';

interface PrintHeaderProps {
  title: string;
  appliedFilters: string[];
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ title, appliedFilters }) => {
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  return (
    <div className="bw-header print-header">
      <h1 className="text-2xl font-black uppercase tracking-wide mb-2 border-b-2 border-black pb-2">
        {title}
      </h1>
      <div className="text-sm font-semibold mb-4">
        Gerado em {formatDate(new Date())} • Sistema de Vendas • Otimizado P&B
      </div>
      
      {appliedFilters.length > 0 && (
        <div className="bw-section border-2 border-black p-3 mt-4">
          <h3 className="font-bold text-sm mb-2 border-b border-black pb-1">
            FILTROS APLICADOS:
          </h3>
          <div className="text-xs">
            {appliedFilters.map((filter, index) => (
              <span key={index} className="inline-block mr-3 mb-1">
                • {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
