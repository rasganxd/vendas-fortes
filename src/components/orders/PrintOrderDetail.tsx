import React from 'react';
import { Order } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useCustomers } from '@/hooks/useCustomers';
import { formatDateToBR } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/format-utils';

interface PrintOrderDetailProps {
  order: Order;
}

export const PrintOrderDetail: React.FC<PrintOrderDetailProps> = ({ order }) => {
  const { settings } = useAppContext();
  const { customers } = useCustomers();
  const companyData = settings?.company;
  const isNegativeOrder = order.total === 0 && order.rejectionReason;
  
  // Find customer data for address information
  const customer = customers.find(c => c.id === order.customerId);

  const handlePrint = () => {
    // Don't print if settings are still loading
    if (!settings || settings.id === 'loading') {
      console.warn('⚠️ Settings still loading, skipping print');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Enhanced CSS styles matching PrintOrdersDialog
    const printStyles = `
      @media print {
        @page {
          margin: 0.8cm;
          size: A4 portrait;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-size: 9pt;
          line-height: 1.3;
          color: #333;
        }
        
        .print-page {
          padding: 0.4cm;
          background: #fafafa;
          border-radius: 6px;
          position: relative;
        }
        
        /* Enhanced company header */
        .company-header {
          text-align: center;
          margin-bottom: 0.5cm;
          padding: 0.3cm;
          background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
          color: white;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .company-header h2 {
          font-weight: 700;
          font-size: 14pt;
          margin: 0 0 0.2cm 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .company-header p {
          font-size: 8pt;
          margin: 1px 0;
          opacity: 0.95;
          font-weight: 300;
        }
        
        /* Order date and info */
        .order-date {
          text-align: center;
          margin-bottom: 0.4cm;
          padding: 0.2cm;
          background: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }
        
        .order-date p {
          font-size: 9pt;
          margin: 0;
          font-weight: 600;
          color: #495057;
        }
        
        /* Information containers */
        .info-container {
          display: flex;
          margin-bottom: 0.4cm;
          gap: 0.3cm;
        }
        
        .info-box {
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 0.3cm;
          flex: 1;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .info-box h3 {
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 0.2cm;
          font-size: 10pt;
          color: #495057;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 0.1cm;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .info-box p {
          font-size: 8pt;
          margin: 2px 0;
          line-height: 1.4;
          color: #6c757d;
        }
        
        .info-box p span {
          color: #495057;
          font-weight: 600;
        }
        
        /* Visit info section for negative orders */
        .visit-info {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 0.3cm;
          border-radius: 6px;
          margin-bottom: 0.4cm;
          border-left: 4px solid #f39c12;
        }
        
        .visit-info h3 {
          font-weight: 700;
          margin-bottom: 0.2cm;
          font-size: 10pt;
          color: #856404;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .visit-info p {
          font-size: 8pt;
          margin: 2px 0;
          color: #856404;
        }
        
        /* Order items section */
        .order-items {
          margin-bottom: 0.4cm;
        }
        
        .order-items h3 {
          font-size: 10pt;
          margin-bottom: 0.3cm;
          color: #495057;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 2px solid #4a90e2;
          padding-bottom: 0.1cm;
        }
        
        /* Enhanced table styles with unit column */
        .order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.5pt;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .order-table th {
          background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
          color: white;
          padding: 0.2cm;
          text-align: left;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .order-table td {
          padding: 0.15cm;
          border-bottom: 1px solid #f1f3f4;
          font-size: 7.5pt;
          line-height: 1.3;
        }
        
        .order-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .order-table .text-right {
          text-align: right;
          font-weight: 600;
          color: #495057;
        }
        
        .order-table .text-center {
          text-align: center;
          font-weight: 600;
        }
        
        /* Enhanced totals section */
        .order-totals {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3cm;
          padding: 0.3cm;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          font-size: 8pt;
        }
        
        .payment-info {
          text-align: left;
          flex: 1;
        }
        
        .payment-info p {
          margin: 2px 0;
          color: #6c757d;
          font-weight: 500;
        }
        
        .total-info {
          text-align: right;
          flex: 1;
        }
        
        .total-info p {
          margin: 2px 0;
          color: #495057;
        }
        
        .total-value {
          font-weight: 700;
          font-size: 11pt;
          color: #28a745;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        /* Enhanced notes section */
        .order-notes {
          margin-top: 0.3cm;
          padding: 0.3cm;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          border-left: 4px solid #f39c12;
        }
        
        .order-notes h3 {
          font-weight: 700;
          margin-bottom: 0.2cm;
          font-size: 9pt;
          color: #856404;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .order-notes p {
          font-size: 8pt;
          line-height: 1.4;
          color: #856404;
          font-style: italic;
        }
        
        /* Enhanced footer */
        .footer {
          margin-top: 0.3cm;
          text-align: center;
          font-size: 7pt;
          color: #6c757d;
          padding: 0.2cm;
          background: #f8f9fa;
          border-radius: 4px;
          border-top: 2px solid #4a90e2;
        }
        
        .footer p {
          margin: 1px 0;
          font-weight: 500;
        }
        
        /* Hide non-printable elements */
        .no-print {
          display: none !important;
        }
      }`;

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

    // Format customer address without state and CEP
    const formatCustomerAddress = () => {
      // Priority: order delivery address > customer address
      const address = order.deliveryAddress || customer?.address || '';
      const neighborhood = customer?.neighborhood || '';
      const city = order.deliveryCity || customer?.city || '';
      
      if (!address && !neighborhood && !city) {
        return 'Não informado';
      }
      
      let addressParts = [];
      if (address) addressParts.push(address);
      if (neighborhood) addressParts.push(neighborhood);
      if (city) addressParts.push(city);
      
      return addressParts.join(', ');
    };

    // Generate order HTML using the same structure as PrintOrdersDialog
    const generateOrderHTML = () => {
      return `
        <div class="print-page">
          ${companyData?.name && companyData.name !== 'Carregando...' ? `
          <div class="company-header">
            <h2>${companyData.name}</h2>
            ${companyData.document ? `<p>CNPJ: ${companyData.document}</p>` : ''}
            ${companyData.address ? `<p>${companyData.address}</p>` : ''}
            ${companyData.phone ? `<p>Tel: ${companyData.phone}</p>` : ''}
          </div>
          ` : ''}
          
          <div class="order-date">
            <p>Pedido #${order.code || 'N/A'} - ${formatDateToBR(order.date)}</p>
          </div>
          
          <div class="info-container">
            <div class="info-box">
              <h3>Dados do Cliente</h3>
              <p><span>Nome:</span> ${order.customerName || 'N/A'}</p>
              <p><span>Telefone:</span> ${customer?.phone || 'N/A'}</p>
              ${customer?.document ? `<p><span>CPF/CNPJ:</span> ${customer.document}</p>` : ''}
            </div>
            
            <div class="info-box">
              <h3>Endereço de Entrega</h3>
              <p>${formatCustomerAddress()}</p>
            </div>
          </div>
          
          ${isNegativeOrder ? `
          <div class="visit-info">
            <h3>Informações da Visita</h3>
            <p><span>Motivo da Recusa:</span> ${getRejectionReasonText(order.rejectionReason)}</p>
            ${order.visitNotes ? `<p><span>Observações:</span> ${order.visitNotes}</p>` : ''}
            <p><span>Projeto:</span> ${order.sourceProject || 'N/A'}</p>
          </div>
          ` : `
          <div class="order-items">
            <h3>Itens do Pedido</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th style="width: 40%;">Produto</th>
                  <th class="text-center" style="width: 12%;">Qtd</th>
                  <th class="text-center" style="width: 10%;">Unidade</th>
                  <th class="text-right" style="width: 19%;">Preço Unit.</th>
                  <th class="text-right" style="width: 19%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item, index) => `
                  <tr>
                    <td style="font-weight: 500; color: #495057;">${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-center">${item.unit || 'UN'}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice || item.price)}</td>
                    <td class="text-right" style="font-weight: 700; color: #28a745;">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; color: #6c757d; font-style: italic; padding: 0.4cm;">
                      Nenhum item encontrado
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
          
          <div class="order-totals">
            <div class="payment-info">
              ${order.paymentMethod ? `<p><strong>Forma de Pagamento:</strong> ${order.paymentMethod}</p>` : ''}
            </div>
            <div class="total-info">
              <p class="total-value">Total: ${formatCurrency(order.total)}</p>
            </div>
          </div>
          `}
          
          ${order.notes ? `
          <div class="order-notes">
            <h3>Observações Importantes</h3>
            <p>${order.notes}</p>
          </div>
          ` : ''}
          
          <div class="footer">
            ${companyData?.footer ? `
              <p>${companyData.footer}</p>
            ` : `
              <p>${companyData?.name && companyData.name !== 'Carregando...' ? companyData.name : 'ForcaVendas'} - Sistema de Gestão de Vendas</p>
              <p>Suporte: ${companyData?.phone || '(11) 9999-8888'}</p>
            `}
          </div>
        </div>
      `;
    };

    // Write HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.code} - ${companyData?.name || 'ForcaVendas'}</title>
          <meta charset="UTF-8">
          <style>${printStyles}</style>
        </head>
        <body>
          <div id="print-content">
            ${generateOrderHTML()}
          </div>
          <script>
            // Trigger printing when content is loaded
            window.onload = function() {
              // Add a small delay to ensure content is rendered
              setTimeout(() => {
                window.print();
                // Close the window when printing is canceled or finished
                setTimeout(() => {
                  window.close();
                }, 2000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      disabled={!settings || settings.id === 'loading'}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Imprimir
    </button>
  );
};
