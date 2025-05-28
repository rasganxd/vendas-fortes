
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
  const companyData = settings?.company;
  
  // Debug company data for bulk printing
  console.log('🖨️ PrintOrdersDialog - Company data for bulk printing:', {
    settingsExists: !!settings,
    companyExists: !!companyData,
    companyName: companyData?.name,
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
  
  // Function to print in a new window with enhanced 2 orders per page layout
  const handlePrintInNewWindow = () => {
    // Don't print if settings are still loading
    if (!settings || settings.id === 'loading') {
      console.warn('⚠️ Settings still loading, skipping print');
      return;
    }

    // Create a new window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Group orders in pairs
    const orderPairs = groupOrdersInPairs(ordersToPrint);

    // Enhanced CSS styles for professional 2 orders per page printing
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
        
        /* Page container for 2 orders */
        .print-page {
          height: 48vh;
          padding: 0.4cm;
          margin-bottom: 0.3cm;
          border-bottom: 2px dashed #e0e0e0;
          overflow: hidden;
          background: #fafafa;
          border-radius: 6px;
          position: relative;
        }
        
        .print-page:last-child {
          border-bottom: none;
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
        
        /* Enhanced table styles */
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
        
        .order-table tbody tr:hover {
          background-color: #e3f2fd;
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
        
        /* Responsive adjustments for single orders */
        .single-order .print-page {
          height: auto;
          min-height: 70vh;
          border-bottom: none;
        }
      }`;

    // Generate enhanced order HTML function
    const generateOrderHTML = (order: Order) => {
      const orderCustomer = validCustomers.find(c => c.id === order.customerId);
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
              ${(order.deliveryCity || orderCustomer?.city) ? `, ${order.deliveryCity || orderCustomer?.city}` : ''}
              ${(order.deliveryState || orderCustomer?.state) ? ` - ${order.deliveryState || orderCustomer?.state}` : ''}
              ${(orderCustomer?.zipCode) ? `, ${orderCustomer.zipCode}` : ''}</p>
            </div>
            ` : ''}
          </div>
          
          <div class="order-items">
            <h3>Itens do Pedido</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Produto</th>
                  <th class="text-center" style="width: 15%;">Qtd</th>
                  <th class="text-right" style="width: 17.5%;">Preço Unit.</th>
                  <th class="text-right" style="width: 17.5%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item, index) => `
                  <tr>
                    <td style="font-weight: 500; color: #495057;">${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right" style="font-weight: 700; color: #28a745;">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" style="text-align: center; color: #6c757d; font-style: italic; padding: 0.4cm;">
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

    // Write enhanced HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impressão de Pedidos - ${companyData?.name || 'ForcaVendas'}</title>
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
