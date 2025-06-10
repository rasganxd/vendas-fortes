
import React from 'react';
import { SalesRepPerformance, TopProduct } from '@/types/reports';
import { formatCurrency, formatNumber } from '@/lib/format-utils';
import { PrintHeader } from './PrintHeader';

interface PrintableProductsBySalesRepProps {
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
  appliedFilters: string[];
}

export const PrintableProductsBySalesRep: React.FC<PrintableProductsBySalesRepProps> = ({
  salesRepPerformance,
  topProducts,
  appliedFilters
}) => {
  return (
    <div className="print-container p-8 bg-white text-black">
      <PrintHeader title="Relatório de Produtos por Vendedor" appliedFilters={appliedFilters} />
      
      {/* Top Produtos */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Top 10 Produtos Mais Vendidos</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-center">Pos.</th>
              <th className="border border-gray-300 p-2 text-left">Produto</th>
              <th className="border border-gray-300 p-2 text-center">Código</th>
              <th className="border border-gray-300 p-2 text-center">Quantidade</th>
              <th className="border border-gray-300 p-2 text-right">Receita</th>
              <th className="border border-gray-300 p-2 text-center">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.slice(0, 10).map((product, index) => (
              <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2 text-center font-bold">
                  {index + 1}°
                </td>
                <td className="border border-gray-300 p-2">{product.name}</td>
                <td className="border border-gray-300 p-2 text-center">#{product.code}</td>
                <td className="border border-gray-300 p-2 text-center">{formatNumber(product.totalQuantity)}</td>
                <td className="border border-gray-300 p-2 text-right font-semibold">
                  {formatCurrency(product.totalRevenue)}
                </td>
                <td className="border border-gray-300 p-2 text-center">{formatNumber(product.ordersCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance por Vendedor */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Performance por Vendedor</h3>
        
        {salesRepPerformance.slice(0, 10).map((rep, index) => (
          <div key={rep.salesRepId} className="mb-6 border border-gray-200 rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-lg">{rep.salesRepName}</h4>
              <span className="text-sm text-gray-600">#{index + 1}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{formatCurrency(rep.totalRevenue)}</div>
                <div className="text-xs text-gray-600">Receita Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatNumber(rep.ordersCount)}</div>
                <div className="text-xs text-gray-600">Pedidos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{formatCurrency(rep.averageOrderValue)}</div>
                <div className="text-xs text-gray-600">Ticket Médio</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{formatNumber(rep.productsCount)}</div>
                <div className="text-xs text-gray-600">Produtos</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {salesRepPerformance.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum vendedor encontrado no período selecionado
        </div>
      )}
      
      <div className="mt-8 text-xs text-gray-500 text-center">
        Página 1 de 1 • Sistema de Vendas
      </div>
    </div>
  );
};
