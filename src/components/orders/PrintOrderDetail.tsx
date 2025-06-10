
import React from 'react';
import { Order } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { formatDateToBR } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/format-utils';

interface PrintOrderDetailProps {
  order: Order;
}

export const PrintOrderDetail: React.FC<PrintOrderDetailProps> = ({ order }) => {
  const { appSettings } = useAppContext();
  const isNegativeOrder = order.total === 0 && order.rejectionReason;

  const handlePrint = () => {
    const printContent = document.getElementById('print-order-detail');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.code}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              margin-bottom: 20px;
              padding-bottom: 10px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-info {
              font-size: 10px;
              color: #666;
            }
            .order-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .total-section {
              margin-top: 20px;
              text-align: right;
            }
            .total-value {
              font-size: 16px;
              font-weight: bold;
            }
            .visit-info {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .notes {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 10px;
              border-radius: 3px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getRejectionReasonText = (reason: string | undefined) => {
    const reasons = {
      'sem_interesse': 'Sem interesse',
      'fechado': 'Estabelecimento fechado',
      'sem_dinheiro': 'Sem dinheiro/recursos',
      'produto_indisponivel': 'Produto indisponível',
      'cliente_ausente': 'Cliente ausente',
      'outro': 'Outro motivo'
    };
    return reasons[reason as keyof typeof reasons] || reason || 'Não informado';
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimir
      </button>

      <div id="print-order-detail" style={{ display: 'none' }}>
        {/* Cabeçalho da empresa */}
        <div className="header">
          <div className="company-name">
            {appSettings?.company?.name || 'Minha Empresa'}
          </div>
          {appSettings?.company && (
            <div className="company-info">
              {appSettings.company.address && <div>{appSettings.company.address}</div>}
              {appSettings.company.phone && <div>Tel: {appSettings.company.phone}</div>}
              {appSettings.company.email && <div>Email: {appSettings.company.email}</div>}
            </div>
          )}
        </div>

        {/* Informações do pedido */}
        <div className="order-info">
          <div>
            <strong>Pedido #{order.code}</strong><br />
            <strong>Data:</strong> {formatDateToBR(order.date)}
          </div>
          <div>
            <strong>Cliente:</strong> {order.customerName}<br />
            <strong>Vendedor:</strong> {order.salesRepName}
          </div>
        </div>

        {isNegativeOrder ? (
          // Informações de visita
          <div className="visit-info">
            <div className="section-title">Informações da Visita</div>
            <p><strong>Motivo da Recusa:</strong> {getRejectionReasonText(order.rejectionReason)}</p>
            {order.visitNotes && (
              <p><strong>Observações:</strong> {order.visitNotes}</p>
            )}
            <p><strong>Projeto:</strong> {order.sourceProject || 'N/A'}</p>
          </div>
        ) : (
          <>
            {/* Itens do pedido */}
            <div className="section">
              <div className="section-title">Itens do Pedido</div>
              {order.items && order.items.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th className="text-right">Qtd</th>
                      <th className="text-right">Preço Unit.</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{formatCurrency(item.unitPrice || item.price)}</td>
                        <td className="text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Nenhum item encontrado</p>
              )}
            </div>

            {/* Total */}
            <div className="total-section">
              <div className="total-value">
                <strong>Total do Pedido: {formatCurrency(order.total)}</strong>
              </div>
            </div>
          </>
        )}

        {/* Observações */}
        {order.notes && (
          <div className="section">
            <div className="section-title">Observações</div>
            <div className="notes">
              {order.notes}
            </div>
          </div>
        )}

        {/* Rodapé */}
        {appSettings?.company?.footer && (
          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10px', color: '#666' }}>
            {appSettings.company.footer}
          </div>
        )}
      </div>
    </>
  );
};
