
import React, { useState, useEffect } from 'react';
import { Order, Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import CustomerSelect from './print/CustomerSelect';
import PrintDialogActions from './print/PrintDialogActions';
import { useAppContext } from '@/hooks/useAppContext';

interface PrintOrdersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  customers?: Customer[];
  selectedOrderIds: string[];
  setSelectedOrderIds?: (ids: string[]) => void;
  filteredOrders?: Order[];
  formatCurrency?: (value: number | undefined) => string;
  clearSelection?: () => void;
}

const PrintOrdersDialog: React.FC<PrintOrdersDialogProps> = ({
  isOpen,
  onOpenChange,
  orders = [],
  customers = [],
  selectedOrderIds = [],
  setSelectedOrderIds = () => {},
  filteredOrders = [],
  formatCurrency = (value) => `R$ ${value?.toFixed(2) || '0.00'}`,
  clearSelection = () => {}
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [ordersToPrint, setOrdersToPrint] = useState<Order[]>([]);
  const { settings } = useAppContext();
  
  // Debug company data for bulk printing
  console.log('🖨️ PrintOrdersDialog - Company data for bulk printing:', {
    settingsExists: !!settings,
    isLoadingState: settings?.id === 'loading'
  });
  
  // Ensure arrays are valid
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeFilteredOrders = Array.isArray(filteredOrders) ? filteredOrders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const validCustomers = safeCustomers.filter(customer => customer && customer.id);

  useEffect(() => {
    if (selectedOrderIds.length > 0) {
      setOrdersToPrint(safeOrders.filter(order => selectedOrderIds.includes(order.id)));
    } else {
      const filtered = selectedCustomerId === "all" 
        ? safeFilteredOrders 
        : safeFilteredOrders.filter(order => order.customerId === selectedCustomerId);
      setOrdersToPrint(filtered);
    }
  }, [selectedOrderIds, selectedCustomerId, safeOrders, safeFilteredOrders]);

  // Function to group orders in pairs for 2-per-page printing
  const groupOrdersInPairs = (orders: Order[]) => {
    const pairs = [];
    for (let i = 0; i < orders.length; i += 2) {
      pairs.push(orders.slice(i, i + 2));
    }
    return pairs;
  };
  
  // Function to print using Electron native printing or fallback to web
  const handlePrintInNewWindow = async () => {
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
    // Group orders in pairs
    const orderPairs = groupOrdersInPairs(ordersToPrint);

    // Ink-saving CSS styles for professional 2 orders per page printing
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
          color: #000;
          background: white;
        }
        
        /* Page container for 2 orders */
        .print-page {
          height: 48vh;
          padding: 0.4cm;
          margin-bottom: 0.3cm;
          border: 1px solid black;
          overflow: hidden;
          background: white;
          position: relative;
        }
        
        .print-page:last-child {
          margin-bottom: 0;
        }
        
        /* Page break after every 2 orders */
        .page-pair {
          page-break-after: always;
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 0.3cm;
        }
        
        .page-pair:last-child {
          page-break-after: auto;
        }
        
        /* Order date and info */
        .order-date {
          text-align: center;
          margin-bottom: 0.4cm;
          padding: 0.2cm;
          background: white;
          border: 1px solid black;
        }
        
        .order-date p {
          font-size: 9pt;
          margin: 0;
          color: black;
        }
        
        /* Information containers */
        .info-container {
          display: flex;
          margin-bottom: 0.4cm;
          gap: 0.3cm;
        }
        
        .info-box {
          border: 1px solid black;
          padding: 0.3cm;
          flex: 1;
          background: white;
        }
        
        .info-box h3 {
          margin-top: 0;
          margin-bottom: 0.2cm;
          font-size: 10pt;
          color: black;
          border-bottom: 1px solid black;
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
        }
        
        /* Order items section */
        .order-items {
          margin-bottom: 0.4cm;
        }
        
        .order-items h3 {
          font-size: 10pt;
          margin-bottom: 0.3cm;
          color: black;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 2px solid black;
          padding-bottom: 0.1cm;
        }
        
        /* Table styles - ink saving optimization */
        .order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.5pt;
          background: white;
        }
        
        .order-table th {
          background: white !important;
          color: black !important;
          border: 2px solid black !important;
          padding: 0.2cm;
          text-align: left;
          font-size: 8pt;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .order-table td {
          padding: 0.15cm;
          border-bottom: 1px solid black;
          font-size: 7.5pt;
          line-height: 1.3;
          background: white;
        }
        
        .order-table tbody tr:nth-child(even) {
          border-top: 1px solid black;
          border-bottom: 1px solid black;
        }
        
        .order-table .text-right {
          text-align: right;
          color: black;
        }
        
        .order-table .text-center {
          text-align: center;
        }
        
        /* Totals section - ink saving */
        .order-totals {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3cm;
          padding: 0.3cm;
          background: white;
          border: 1px solid black;
          font-size: 8pt;
        }
        
        .payment-info {
          text-align: left;
          flex: 1;
        }
        
        .payment-info p {
          margin: 2px 0;
          color: black;
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
          font-size: 11pt;
          color: black;
        }
        
        /* Notes section - ink saving */
        .order-notes {
          margin-top: 0.3cm;
          padding: 0.3cm;
          background: white;
          border: 1px solid black;
          border-left: 3px solid black;
        }
        
        .order-notes h3 {
          margin-bottom: 0.2cm;
          font-size: 9pt;
          color: black;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .order-notes p {
          font-size: 8pt;
          line-height: 1.4;
          color: black;
          font-style: italic;
        }
        
        /* Hide non-printable elements */
        .no-print {
          display: none !important;
        }
        
        /* Responsive adjustments for single orders */
        .single-order .print-page {
          height: auto;
          min-height: 70vh;
        }
      }`;

    // Generate enhanced order HTML function
    const generateOrderHTML = (order: Order) => {
      const orderCustomer = validCustomers.find(c => c.id === order.customerId);
      return `
        <div class="print-page">
          <div class="order-date">
            <p>Pedido #${order.code || 'N/A'} - ${new Date(order.createdAt).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div class="info-container">
            <div class="info-box">
              <h3>Dados do Cliente</h3>
              <p><span>Nome:</span> ${orderCustomer?.name || 'N/A'}</p>
              <p><span>Telefone:</span> ${orderCustomer?.phone || 'N/A'}</p>
              ${orderCustomer?.document ? `<p><span>CPF/CNPJ:</span> ${orderCustomer.document}</p>` : ''}
            </div>
            
            ${(orderCustomer?.address || order.deliveryAddress) ? `
            <div class="info-box">
              <h3>Endereço de Entrega</h3>
              <p>${order.deliveryAddress || orderCustomer?.address || ''}
              ${orderCustomer?.neighborhood ? `, ${orderCustomer.neighborhood}` : ''}
              ${(order.deliveryCity || orderCustomer?.city) ? `, ${order.deliveryCity || orderCustomer?.city}` : ''}</p>
            </div>
            ` : ''}
          </div>
          
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
                    <td>${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-center">${item.unit || 'UN'}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right">${formatCurrency(item.total)}</td>
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
          
          <div class="order-totals">
            <div class="payment-info">
              ${order.paymentStatus !== 'pending' ? `<p><strong>Status:</strong> ${order.paymentStatus}</p>` : ''}
              ${order.paymentMethod ? `<p><strong>Forma de Pagamento:</strong> ${order.paymentMethod}</p>` : ''}
            </div>
            <div class="total-info">
              <p class="total-value">Total: ${formatCurrency(order.total)}</p>
            </div>
          </div>
          
          ${order.notes ? `
          <div class="order-notes">
            <h3>Observações Importantes</h3>
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
          <title>Impressão de Pedidos</title>
          <meta charset="UTF-8">
          <style>${printStyles}</style>
        </head>
        <body class="${orderPairs.length === 1 && orderPairs[0].length === 1 ? 'single-order' : ''}">
          <div id="print-content">
            ${orderPairs.map((pair, pairIndex) => `
              <div class="page-pair">
                ${pair.map(order => generateOrderHTML(order)).join('')}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Pedidos</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <CustomerSelect 
            selectedCustomerId={selectedCustomerId} 
            setSelectedCustomerId={setSelectedCustomerId}
            customers={validCustomers}
          />
        </div>
        
        <DialogFooter>
          <PrintDialogActions
            handleBulkPrint={handlePrintInNewWindow}
            onOpenChange={onOpenChange}
            isPrintDisabled={ordersToPrint.length === 0 || !settings || settings.id === 'loading'}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrdersDialog;
