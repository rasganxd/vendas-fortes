
import React from 'react';
import { SalesReportData } from '@/types/reports';
import { formatCurrency, formatDateBR } from '@/lib/format-utils';
import { PrintHeader } from './PrintHeader';

interface PrintableCompleteReportProps {
  data: SalesReportData[];
  appliedFilters: string[];
}

export const PrintableCompleteReport: React.FC<PrintableCompleteReportProps> = ({
  data,
  appliedFilters
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'confirmed': return 'Confirmado';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="print-container p-8 bg-white text-black">
      <PrintHeader title="Relatório Completo de Vendas" appliedFilters={appliedFilters} />
      
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Total de registros: <strong>{data.length}</strong>
        </p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Pedido</th>
            <th className="border border-gray-300 p-2 text-left">Data</th>
            <th className="border border-gray-300 p-2 text-left">Cliente</th>
            <th className="border border-gray-300 p-2 text-left">Vendedor</th>
            <th className="border border-gray-300 p-2 text-center">Itens</th>
            <th className="border border-gray-300 p-2 text-right">Valor</th>
            <th className="border border-gray-300 p-2 text-center">Status</th>
            <th className="border border-gray-300 p-2 text-center">Pagamento</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sale, index) => (
            <tr key={sale.orderId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 p-2">#{sale.orderCode}</td>
              <td className="border border-gray-300 p-2">{formatDateBR(sale.date)}</td>
              <td className="border border-gray-300 p-2">{sale.customerName}</td>
              <td className="border border-gray-300 p-2">{sale.salesRepName}</td>
              <td className="border border-gray-300 p-2 text-center">{sale.itemsCount}</td>
              <td className="border border-gray-300 p-2 text-right font-semibold">
                {formatCurrency(sale.total)}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {getStatusLabel(sale.status)}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {sale.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum dado encontrado para os filtros selecionados
        </div>
      )}
      
      <div className="mt-8 text-xs text-gray-500 text-center">
        Página 1 de 1 • Sistema de Vendas
      </div>
    </div>
  );
};
