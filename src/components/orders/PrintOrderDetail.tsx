
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
        printBackground: true,
        color: true,
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
    // Traditional invoice-style CSS with Courier New font
    const printStyles = `
      @media print {
        @page {
          margin: 1cm;
          size: A4 portrait;
        }
        
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 0;
          font-size: 12pt;
          line-height: 1.2;
          color: #000;
          background: white;
        }
        
        .invoice-container {
          padding: 0.5cm;
          background: white;
        }
        
        /* Header section */
        .invoice-header {
          margin-bottom: 0.5cm;
          border-bottom: 1px solid #000;
          padding-bottom: 0.3cm;
        }
        
        .invoice-title {
          text-align: center;
          font-size: 13pt;
          margin-bottom: 0.3cm;
          text-transform: uppercase;
        }
        
        /* Customer info in traditional format */
        .customer-info {
          margin-bottom: 0.4cm;
          font-size: 11pt;
        }
        
        .customer-line {
          margin: 2px 0;
          display: flex;
          gap: 2cm;
        }
        
        .customer-line .label {
          min-width: 3cm;
        }
        
        .customer-line .value {
          flex: 1;
        }
        
        /* Visit info for negative orders */
        .visit-section {
          margin-bottom: 0.4cm;
          padding: 0.3cm;
          border: 1px solid #000;
          background: #f9f9f9;
        }
        
        .visit-section h3 {
          margin: 0 0 0.2cm 0;
          font-size: 11pt;
          text-transform: uppercase;
        }
        
        .visit-section p {
          margin: 2px 0;
          font-size: 10pt;
        }
        
        /* Products table */
        .products-section {
          margin-bottom: 0.4cm;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }
        
        .products-table th {
          background: white;
          color: #000;
          border-bottom: 1px solid #000;
          padding: 0.2cm 0.1cm;
          text-align: left;
          text-transform: uppercase;
        }
        
        .products-table th.text-right,
        .products-table td.text-right {
          text-align: right;
        }
        
        .products-table th.text-center,
        .products-table td.text-center {
          text-align: center;
        }
        
        .products-table td {
          border-bottom: 1px solid #ccc;
          padding: 0.1cm;
          vertical-align: top;
        }
        
        .products-table tbody tr:last-child td {
          border-bottom: 1px solid #000;
        }
        
        /* Totals section */
        .totals-section {
          margin-top: 0.4cm;
          text-align: right;
          font-size: 11pt;
        }
        
        .total-line {
          margin: 2px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-line .label {
          text-transform: uppercase;
        }
        
        .total-line .value {
          min-width: 3cm;
          text-align: right;
        }
        
        .grand-total {
          border-top: 1px solid #000;
          padding-top: 0.2cm;
          margin-top: 0.2cm;
          font-size: 12pt;
          border-bottom: 1px dotted #000;
          padding-bottom: 0.2cm;
        }
        
        /* Notes section */
        .notes-section {
          margin-top: 0.5cm;
          padding-top: 0.3cm;
          border-top: 1px solid #000;
        }
        
        .notes-section h3 {
          margin: 0 0 0.2cm 0;
          font-size: 10pt;
          text-transform: uppercase;
        }
        
        .notes-section p {
          font-size: 9pt;
          line-height: 1.3;
          font-style: italic;
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

    // Format customer address
    const formatCustomerAddress = () => {
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

    // Generate order HTML in traditional format
    const generateOrderHTML = () => {
      return `
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="invoice-title">
              ${isNegativeOrder ? 'Relatório de Visita' : 'Pedido de Venda'}
            </div>
          </div>
          
          <div class="customer-info">
            <div class="customer-line">
              <span class="label">Pedido.:</span>
              <span class="value">#${order.code || 'N/A'}</span>
              <span class="label">Data:</span>
              <span class="value">${formatDateToBR(order.date)}</span>
            </div>
            <div class="customer-line">
              <span class="label">Cliente.:</span>
              <span class="value">${order.customerName || 'N/A'}</span>
              <span class="label">Vendedor:</span>
              <span class="value">${order.salesRepName || 'N/A'}</span>
            </div>
            <div class="customer-line">
              <span class="label">Telefone:</span>
              <span class="value">${customer?.phone || 'N/A'}</span>
              ${customer?.document ? `<span class="label">CPF/CNPJ:</span><span class="value">${customer.document}</span>` : ''}
            </div>
            <div class="customer-line">
              <span class="label">Endereço:</span>
              <span class="value">${formatCustomerAddress()}</span>
            </div>
          </div>
          
          ${isNegativeOrder ? `
          <div class="visit-section">
            <h3>Informações da Visita</h3>
            <p>Motivo da Recusa: ${getRejectionReasonText(order.rejectionReason)}</p>
            ${order.visitNotes ? `<p>Observações: ${order.visitNotes}</p>` : ''}
            <p>Projeto: ${order.sourceProject || 'N/A'}</p>
          </div>
          ` : `
          <div class="products-section">
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 8%;">Qtd</th>
                  <th style="width: 8%;">Un</th>
                  <th style="width: 44%;">Descrição</th>
                  <th class="text-right" style="width: 20%;">R$ Unitário</th>
                  <th class="text-right" style="width: 20%;">R$ Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item, index) => `
                  <tr>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-center">${item.unit || 'UN'}</td>
                    <td>${item.productName}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice || item.price)}</td>
                    <td class="text-right">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; font-style: italic; padding: 0.4cm;">
                      Nenhum item encontrado
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
          
          <div class="totals-section">
            ${order.paymentMethod ? `
            <div class="total-line">
              <span class="label">Forma de Pagamento:</span>
              <span class="value">${order.paymentMethod}</span>
            </div>
            ` : ''}
            <div class="total-line grand-total">
              <span class="label">Total Geral:</span>
              <span class="value">${formatCurrency(order.total)}</span>
            </div>
          </div>
          `}
          
          ${order.notes ? `
          <div class="notes-section">
            <h3>Observações</h3>
            <p>${order.notes}</p>
          </div>
          ` : ''}
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.code}</title>
          <meta charset="UTF-8">
          <style>${printStyles}</style>
        </head>
        <body>
          <div id="print-content">
            ${generateOrderHTML()}
          </div>
        </body>
      </html>
    `;
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
