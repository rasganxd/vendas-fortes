
import React from 'react';
import { SalesMetrics, SalesRepPerformance } from '@/types/reports';
import { formatCurrency, formatNumber } from '@/lib/format-utils';
import { PrintHeader } from './PrintHeader';

interface PrintableBasicReportProps {
  metrics: SalesMetrics;
  salesRepPerformance: SalesRepPerformance[];
  appliedFilters: string[];
}

export const PrintableBasicReport: React.FC<PrintableBasicReportProps> = ({
  metrics,
  salesRepPerformance,
  appliedFilters
}) => {
  return (
    <div className="print-container p-8 bg-white text-black">
      <PrintHeader title="Relatório Básico - Resumo Executivo" appliedFilters={appliedFilters} />
      
      {/* Métricas principais */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Resumo de Vendas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-green-600">{formatNumber(metrics.totalOrders)}</div>
            <div className="text-sm text-gray-600">Total de Pedidos</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.averageOrderValue)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(metrics.totalProducts)}</div>
            <div className="text-sm text-gray-600">Produtos Vendidos</div>
          </div>
        </div>
      </div>

      {/* Performance dos vendedores */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Top 10 Vendedores</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-center">Posição</th>
              <th className="border border-gray-300 p-2 text-left">Vendedor</th>
              <th className="border border-gray-300 p-2 text-center">Pedidos</th>
              <th className="border border-gray-300 p-2 text-right">Receita Total</th>
              <th className="border border-gray-300 p-2 text-right">Ticket Médio</th>
            </tr>
          </thead>
          <tbody>
            {salesRepPerformance.slice(0, 10).map((rep, index) => (
              <tr key={rep.salesRepId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2 text-center font-bold">
                  {index + 1}°
                </td>
                <td className="border border-gray-300 p-2">{rep.salesRepName}</td>
                <td className="border border-gray-300 p-2 text-center">{formatNumber(rep.ordersCount)}</td>
                <td className="border border-gray-300 p-2 text-right font-semibold">
                  {formatCurrency(rep.totalRevenue)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {formatCurrency(rep.averageOrderValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 text-xs text-gray-500 text-center">
        Página 1 de 1 • Sistema de Vendas
      </div>
    </div>
  );
};
