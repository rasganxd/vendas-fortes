
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

    // Traditional invoice-style CSS with Courier New font for bulk printing
    const printStyles = `
      @media print {
        @page {
          margin: 0.8cm;
          size: A4 portrait;
        }
        
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 0;
          font-size: 10pt;
          line-height: 1.2;
          color: #000;
          background: white;
        }
        
        /* Page container for 2 orders */
        .invoice-container {
          height: 48vh;
          padding: 0.4cm;
          margin-bottom: 0.3cm;
          border: 1px solid black;
          overflow: hidden;
          background: white;
          position: relative;
        }
        
        .invoice-container:last-child {
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
        
        /* Header section */
        .invoice-header {
          margin-bottom: 0.3cm;
          border-bottom: 1px solid #000;
          padding-bottom: 0.2cm;
        }
        
        .invoice-title {
          text-align: center;
          font-size: 10pt;
          margin-bottom: 0.2cm;
          text-transform: uppercase;
        }
        
        /* Customer info in traditional format */
        .customer-info {
          margin-bottom: 0.3cm;
          font-size: 9pt;
        }
        
        .customer-line {
          margin: 1px 0;
          display: flex;
          gap: 1cm;
        }
        
        .customer-line .label {
          min-width: 2.5cm;
        }
        
        .customer-line .value {
          flex: 1;
        }
        
        /* Products table */
        .products-section {
          margin-bottom: 0.3cm;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
        }
        
        .products-table th {
          background: white;
          color: #000;
          border-bottom: 2px solid #000;
          padding: 0.15cm 0.05cm;
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
          padding: 0.05cm;
          vertical-align: top;
        }
        
        .products-table tbody tr:last-child td {
          border-bottom: 1px solid #000;
        }
        
        /* Totals section */
        .totals-section {
          margin-top: 0.3cm;
          text-align: right;
          font-size: 9pt;
        }
        
        .total-line {
          margin: 1px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-line .label {
          text-transform: uppercase;
        }
        
        .total-line .value {
          min-width: 2.5cm;
          text-align: right;
        }
        
        .grand-total {
          border-top: 2px solid #000;
          padding-top: 0.1cm;
          margin-top: 0.1cm;
          font-size: 9pt;
          border-bottom: 1px dotted #000;
          padding-bottom: 0.1cm;
        }
        
        /* Notes section */
        .notes-section {
          margin-top: 0.3cm;
          padding-top: 0.2cm;
          border-top: 1px solid #000;
        }
        
        .notes-section h3 {
          margin: 0 0 0.1cm 0;
          font-size: 8pt;
          text-transform: uppercase;
        }
        
        .notes-section p {
          font-size: 7pt;
          line-height: 1.3;
          font-style: italic;
        }
        
        /* Hide non-printable elements */
        .no-print {
          display: none !important;
        }
        
        /* Responsive adjustments for single orders */
        .single-order .invoice-container {
          height: auto;
          min-height: 70vh;
        }
      }`;

    // Generate enhanced order HTML function
    const generateOrderHTML = (order: Order) => {
      const orderCustomer = validCustomers.find(c => c.id === order.customerId);
      const isNegativeOrder = order.total === 0 && order.rejectionReason;
      
      // Format customer address
      const formatCustomerAddress = () => {
        const address = order.deliveryAddress || orderCustomer?.address || '';
        const neighborhood = orderCustomer?.neighborhood || '';
        const city = order.deliveryCity || orderCustomer?.city || '';
        
        if (!address && !neighborhood && !city) {
          return 'Não informado';
        }
        
        let addressParts = [];
        if (address) addressParts.push(address);
        if (neighborhood) addressParts.push(neighborhood);
        if (city) addressParts.push(city);
        
        return addressParts.join(', ');
      };

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
              <span class="value">${new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="customer-line">
              <span class="label">Cliente.:</span>
              <span class="value">${orderCustomer?.name || 'N/A'}</span>
              <span class="label">Vendedor:</span>
              <span class="value">${order.salesRepName || 'N/A'}</span>
            </div>
            <div class="customer-line">
              <span class="label">Telefone:</span>
              <span class="value">${orderCustomer?.phone || 'N/A'}</span>
              ${orderCustomer?.document ? `<span class="label">CPF/CNPJ:</span><span class="value">${orderCustomer.document}</span>` : ''}
            </div>
            <div class="customer-line">
              <span class="label">Endereço:</span>
              <span class="value">${formatCustomerAddress()}</span>
            </div>
          </div>
          
          ${!isNegativeOrder ? `
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
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
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
          ` : ''}
          
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
