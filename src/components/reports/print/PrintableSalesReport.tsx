
import React from 'react';
import { SalesReportData } from '@/types/reports';
import { formatCurrency, formatDateBR } from '@/lib/format-utils';
import { PrintHeader } from './PrintHeader';

interface PrintableSalesReportProps {
  data: SalesReportData[];
  appliedFilters: string[];
}

export const PrintableSalesReport: React.FC<PrintableSalesReportProps> = ({
  data,
  appliedFilters
}) => {
  const totalRevenue = data.reduce((sum, sale) => sum + sale.total, 0);
  const averageOrderValue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <div className="print-container p-8 bg-white text-black">
      <PrintHeader title="Relatório de Vendas" appliedFilters={appliedFilters} />
      
      {/* Resumo das vendas */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-gray-600">Total de Vendas</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Pedido</th>
            <th className="border border-gray-300 p-2 text-left">Data</th>
            <th className="border border-gray-300 p-2 text-left">Cliente</th>
            <th className="border border-gray-300 p-2 text-left">Vendedor</th>
            <th className="border border-gray-300 p-2 text-right">Valor</th>
            <th className="border border-gray-300 p-2 text-right">% do Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sale, index) => {
            const percentage = totalRevenue > 0 ? (sale.total / totalRevenue) * 100 : 0;
            return (
              <tr key={sale.orderId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2">#{sale.orderCode}</td>
                <td className="border border-gray-300 p-2">{formatDateBR(sale.date)}</td>
                <td className="border border-gray-300 p-2">{sale.customerName}</td>
                <td className="border border-gray-300 p-2">{sale.salesRepName}</td>
                <td className="border border-gray-300 p-2 text-right font-semibold">
                  {formatCurrency(sale.total)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {percentage.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma venda encontrada para os filtros selecionados
        </div>
      )}
      
      <div className="mt-8 text-xs text-gray-500 text-center">
        Página 1 de 1 • Sistema de Vendas
      </div>
    </div>
  );
};
