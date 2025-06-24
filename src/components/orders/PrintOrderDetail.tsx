
import React from 'react';
import { Order } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useCustomers } from '@/hooks/useCustomers';
import { formatDateToBR } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/format-utils';
import { generateBWOptimizedHTML, addBWClasses, getStatusIcon, getPaymentIcon } from '@/utils/printBWOptimizer';

interface PrintOrderDetailProps {
  order: Order;
}

export const PrintOrderDetail: React.FC<PrintOrderDetailProps> = ({ order }) => {
  const { settings } = useAppContext();
  const { customers } = useCustomers();
  const isNegativeOrder = order.total === 0 && order.rejectionReason;
  
  // Find customer data for address information
  const customer = customers.find(c => c.id === order.customerId);

  const handlePrint = async () => {
    // Don't print if settings are still loading
    if (!settings || settings.id === 'loading') {
      console.warn('⚠️ Settings still loading, skipping print');
      return;
    }

    // Verificar se está no Electron
    if (window.electronAPI && window.electronAPI.printContent) {
      // Usar sistema de impressão nativo do Electron
      await handleElectronPrint();
    } else {
      // Fallback para web (manter funcionalidade existente)
      handleWebPrint();
    }
  };

  const handleElectronPrint = async () => {
    try {
      const htmlContent = generatePrintHTML();
      const result = await window.electronAPI.printContent(htmlContent, {
        printBackground: false, // Disable background for B&W
        color: false, // Force grayscale
        margins: {
          marginType: 'custom',
          top: 0.8,
          bottom: 0.8,
          left: 0.8,
          right: 0.8
        }
      });
      
      if (!result.success) {
        console.error('Erro na impressão:', result.error);
        handleWebPrint();
      }
    } catch (error) {
      console.error('Erro ao imprimir com Electron:', error);
      // Fallback para impressão web
      handleWebPrint();
    }
  };

  const handleWebPrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const htmlContent = generatePrintHTML();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 2000);
      }, 500);
    };
  };

  const generatePrintHTML = () => {
    // Enhanced CSS styles for B&W printing
    const printStyles = `
      @media print {
        @page {
          margin: 0.8cm;
          size: A4 portrait;
        }
        
        * {
          background: white !important;
          color: black !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          font-size: 9pt;
          line-height: 1.3;
          color: black;
          background: white;
        }
        
        .print-page {
          padding: 0.4cm;
          background: white !important;
          border: 2px solid black;
          border-radius: 6px;
          position: relative;
        }
        
        /* B&W optimized headers */
        .order-date {
          text-align: center;
          margin-bottom: 0.4cm;
          padding: 0.2cm;
          background: white !important;
          border: 2px double black !important;
          border-radius: 4px;
        }
        
        .order-date p {
          font-size: 9pt;
          margin: 0;
          font-weight: 900;
          color: black;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Information containers with B&W borders */
        .info-container {
          display: flex;
          margin-bottom: 0.4cm;
          gap: 0.3cm;
        }
        
        .info-box {
          border: 2px solid black !important;
          border-radius: 6px;
          padding: 0.3cm;
          flex: 1;
          background: white !important;
        }
        
        .info-box h3 {
          font-weight: 900;
          margin-top: 0;
          margin-bottom: 0.2cm;
          font-size: 10pt;
          color: black;
          border-bottom: 2px solid black !important;
          padding-bottom: 0.1cm;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .info-box p {
          font-size: 8pt;
          margin: 2px 0;
          line-height: 1.4;
          color: black;
        }
        
        .info-box p span {
          color: black;
          font-weight: 700;
        }
        
        /* Visit info section for negative orders */
        .visit-info {
          background-color: white !important;
          border: 3px double black !important;
          padding: 0.3cm;
          border-radius: 6px;
          margin-bottom: 0.4cm;
        }
        
        .visit-info h3 {
          font-weight: 900;
          margin-bottom: 0.2cm;
          font-size: 10pt;
          color: black;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid black;
          padding-bottom: 0.1cm;
        }
        
        .visit-info p {
          font-size: 8pt;
          margin: 2px 0;
          color: black;
          font-weight: 600;
        }
        
        /* Order items section */
        .order-items {
          margin-bottom: 0.4cm;
        }
        
        .order-items h3 {
          font-size: 10pt;
          margin-bottom: 0.3cm;
          color: black;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 3px double black !important;
          padding-bottom: 0.1cm;
        }
        
        /* B&W optimized table styles */
        .order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.5pt;
          background: white !important;
          border: 2px solid black !important;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .order-table th {
          background: black !important;
          color: white !important;
          padding: 0.2cm;
          text-align: left;
          font-size: 8pt;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: 1px solid white !important;
        }
        
        .order-table td {
          padding: 0.15cm;
          border: 1px solid black !important;
          font-size: 7.5pt;
          line-height: 1.3;
          background: white !important;
          color: black !important;
        }
        
        .order-table tbody tr:nth-child(even) {
          border-top: 2px solid black !important;
          border-bottom: 2px solid black !important;
        }
        
        .order-table .text-right {
          text-align: right;
          font-weight: 700;
          color: black;
        }
        
        .order-table .text-center {
          text-align: center;
          font-weight: 700;
        }
        
        /* B&W optimized totals section */
        .order-totals {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3cm;
          padding: 0.3cm;
          background: white !important;
          border: 2px solid black !important;
          border-radius: 6px;
          font-size: 8pt;
        }
        
        .payment-info {
          text-align: left;
          flex: 1;
        }
        
        .payment-info p {
          margin: 2px 0;
          color: black;
          font-weight: 600;
        }
        
        .total-info {
          text-align: right;
          flex: 1;
        }
        
        .total-info p {
          margin: 2px 0;
          color: black;
        }
        
        .total-value {
          font-weight: 900;
          font-size: 11pt;
          color: black;
          border: 1px solid black;
          padding: 4px;
          background: white !important;
        }
        
        /* B&W optimized notes section */
        .order-notes {
          margin-top: 0.3cm;
          padding: 0.3cm;
          background: white !important;
          border: 3px double black !important;
          border-radius: 6px;
        }
        
        .order-notes h3 {
          font-weight: 900;
          margin-bottom: 0.2cm;
          font-size: 9pt;
          color: black;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid black;
          padding-bottom: 0.1cm;
        }
        
        .order-notes p {
          font-size: 8pt;
          line-height: 1.4;
          color: black;
          font-weight: 600;
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

    // Generate order HTML using B&W optimization
    const generateOrderHTML = () => {
      const statusIcon = getStatusIcon(order.status || 'pending');
      const paymentIcon = getPaymentIcon(order.paymentMethod || '');
      
      return `
        <div class="print-page bw-section">
          <div class="order-date bw-header">
            <p>Pedido #${order.code || 'N/A'} - ${formatDateToBR(order.date)}</p>
          </div>
          
          <div class="info-container">
            <div class="info-box bw-section">
              <h3>Dados do Cliente</h3>
              <p><span>Nome:</span> ${order.customerName || 'N/A'}</p>
              <p><span>Telefone:</span> ${customer?.phone || 'N/A'}</p>
              ${customer?.document ? `<p><span>CPF/CNPJ:</span> ${customer.document}</p>` : ''}
            </div>
            
            <div class="info-box bw-section">
              <h3>Endereço de Entrega</h3>
              <p>${formatCustomerAddress()}</p>
            </div>
          </div>
          
          ${isNegativeOrder ? `
          <div class="visit-info bw-important">
            <h3>Informações da Visita</h3>
            <p><span>Motivo da Recusa:</span> ${getRejectionReasonText(order.rejectionReason)}</p>
            ${order.visitNotes ? `<p><span>Observações:</span> ${order.visitNotes}</p>` : ''}
            <p><span>Projeto:</span> ${order.sourceProject || 'N/A'}</p>
          </div>
          ` : `
          <div class="order-items">
            <h3>Itens do Pedido</h3>
            <table class="order-table bw-table">
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
                    <td style="font-weight: 600; color: black;">${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-center">${item.unit || 'UN'}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice || item.price)}</td>
                    <td class="text-right" style="font-weight: 900; color: black;">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; color: black; font-style: italic; padding: 0.4cm;">
                      Nenhum item encontrado
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
          
          <div class="order-totals bw-section">
            <div class="payment-info">
              ${order.paymentMethod ? `<p><strong>${paymentIcon} Forma de Pagamento:</strong> ${order.paymentMethod}</p>` : ''}
            </div>
            <div class="total-info">
              <p class="total-value bw-total">Total: ${formatCurrency(order.total)}</p>
            </div>
          </div>
          `}
          
          ${order.notes ? `
          <div class="order-notes bw-important">
            <h3>Observações Importantes</h3>
            <p>${order.notes}</p>
          </div>
          ` : ''}
        </div>
      `;
    };

    // Use the B&W optimizer to generate the final HTML
    const orderHTML = generateOrderHTML();
    const optimizedHTML = addBWClasses(orderHTML);

    return generateBWOptimizedHTML(
      optimizedHTML,
      `Pedido #${order.code} - P&B`
    );
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
