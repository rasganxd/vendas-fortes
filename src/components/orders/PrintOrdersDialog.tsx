
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
  
  // Function to print in a new window with 2 orders per page layout
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

    // CSS styles for 2 orders per page printing
    const printStyles = `
      @media print {
        @page {
          margin: 0.5cm;
          size: portrait;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-size: 9pt;
        }
        
        /* Page container for 2 orders */
        .print-page {
          height: 49vh;
          padding: 0.3cm;
          margin-bottom: 0.2cm;
          border-bottom: 1px dashed #ccc;
          overflow: hidden;
        }
        
        .print-page:last-child {
          border-bottom: none;
        }
        
        /* Page break after every 2 orders */
        .page-pair {
          page-break-after: always;
          height: 100vh;
        }
        
        .page-pair:last-child {
          page-break-after: auto;
        }
        
        .company-header {
          text-align: center;
          margin-bottom: 0.4cm;
        }
        
        .company-header h2 {
          font-weight: bold;
          font-size: 12pt;
          margin: 0;
        }
        
        .company-header p {
          font-size: 8pt;
          color: #666;
          margin: 2px 0;
        }
        
        .order-date {
          text-align: center;
          margin-bottom: 0.4cm;
        }
        
        .order-date p {
          font-size: 8pt;
          margin: 0;
        }
        
        .info-container {
          display: flex;
          margin-bottom: 0.4cm;
          gap: 0.2cm;
        }
        
        .info-box {
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 0.2cm;
          flex: 1;
        }
        
        .info-box h3 {
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 0.2cm;
          font-size: 9pt;
        }
        
        .info-box p {
          font-size: 7pt;
          margin: 1px 0;
          line-height: 1.2;
        }
        
        .order-items {
          margin-bottom: 0.4cm;
        }
        
        .order-items h3 {
          font-size: 9pt;
          margin-bottom: 0.2cm;
        }
        
        .order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7pt;
        }
        
        .order-table th {
          background-color: #f3f4f6;
          padding: 3px;
          text-align: left;
          border: 1px solid #ddd;
          font-size: 7pt;
        }
        
        .order-table td {
          padding: 3px;
          border: 1px solid #ddd;
          font-size: 7pt;
          line-height: 1.1;
        }
        
        .order-table .text-right {
          text-align: right;
        }
        
        .order-table .text-center {
          text-align: center;
        }
        
        .order-totals {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.2cm;
          font-size: 8pt;
        }
        
        .payment-info {
          text-align: left;
        }
        
        .total-info {
          text-align: right;
        }
        
        .total-value {
          font-weight: bold;
          font-size: 9pt;
        }
        
        .order-notes {
          margin-top: 0.2cm;
        }
        
        .order-notes h3 {
          font-weight: 600;
          margin-bottom: 3px;
          font-size: 8pt;
        }
        
        .order-notes p {
          font-size: 7pt;
          line-height: 1.2;
        }
        
        .footer {
          margin-top: 0.2cm;
          text-align: center;
          font-size: 6pt;
          color: #666;
        }
        
        /* Hide non-printable elements */
        .no-print {
          display: none !important;
        }
      }`;

    // Generate order HTML function - with real company data
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
            <p>Pedido #${order.code || 'N/A'} - Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="info-container">
            <div class="info-box">
              <h3>Cliente</h3>
              <p><span style="font-weight: 600;">Nome:</span> ${orderCustomer?.name || ''}</p>
              <p><span style="font-weight: 600;">Tel:</span> ${orderCustomer?.phone || ''}</p>
              ${orderCustomer?.document ? `<p><span style="font-weight: 600;">CPF/CNPJ:</span> ${orderCustomer.document}</p>` : ''}
            </div>
            
            ${(orderCustomer?.address || order.deliveryAddress) ? `
            <div class="info-box">
              <h3>Endereço</h3>
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
                  <th>Produto</th>
                  <th class="text-center">Qtd</th>
                  <th class="text-right">Preço Unit.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" style="text-align: center; color: #666;">
                      Nenhum item encontrado
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
          
          <div class="order-totals">
            <div class="payment-info">
              ${order.paymentStatus !== 'pending' ? `<p class="font-semibold">${order.paymentStatus}</p>` : ''}
              ${order.paymentMethod ? `<p>${order.paymentMethod}</p>` : ''}
            </div>
            <div class="total-info">
              <p class="total-value">Total: ${formatCurrency(order.total)}</p>
            </div>
          </div>
          
          ${order.notes ? `
          <div class="order-notes">
            <h3>Observações:</h3>
            <p>${order.notes}</p>
          </div>
          ` : ''}
          
          <div class="footer">
            ${companyData?.footer ? `
              <p>${companyData.footer}</p>
            ` : `
              <p>${companyData?.name && companyData.name !== 'Carregando...' ? companyData.name : 'ForcaVendas'} - Sistema de Gestão de Vendas</p>
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
          <title>Impressão de Pedidos</title>
          <style>${printStyles}</style>
        </head>
        <body>
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
