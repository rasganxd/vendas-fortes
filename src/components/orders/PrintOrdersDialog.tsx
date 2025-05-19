
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
  customers?: Customer[]; // Make optional
  selectedOrderIds: string[];
  setSelectedOrderIds?: (ids: string[]) => void; // Make optional
  filteredOrders?: Order[]; // Make optional
  formatCurrency?: (value: number | undefined) => string; // Make optional
  clearSelection?: () => void; // Added optional clearSelection prop
}

const PrintOrdersDialog: React.FC<PrintOrdersDialogProps> = ({
  isOpen,
  onOpenChange,
  orders = [], // Default to empty array
  customers = [], // Default to empty array
  selectedOrderIds = [], // Default to empty array
  setSelectedOrderIds = () => {}, // Default no-op function
  filteredOrders = [], // Default to empty array
  formatCurrency = (value) => `R$ ${value?.toFixed(2) || '0.00'}`, // Default formatter
  clearSelection = () => {} // Default no-op function
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [ordersToPrint, setOrdersToPrint] = useState<Order[]>([]);
  const { settings } = useAppContext();
  const companyData = settings?.company;
  
  // Ensure arrays are valid
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeFilteredOrders = Array.isArray(filteredOrders) ? filteredOrders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const validCustomers = safeCustomers.filter(customer => customer && customer.id);

  useEffect(() => {
    if (selectedOrderIds.length > 0) {
      setOrdersToPrint(safeOrders.filter(order => selectedOrderIds.includes(order.id)));
    } else {
      // Use the filteredOrders safely here
      const filtered = selectedCustomerId === "all" 
        ? safeFilteredOrders 
        : safeFilteredOrders.filter(order => order.customerId === selectedCustomerId);
      setOrdersToPrint(filtered);
    }
  }, [selectedOrderIds, selectedCustomerId, safeOrders, safeFilteredOrders]);
  
  // Function to print in a new window with the improved layout
  const handlePrintInNewWindow = () => {
    // Create a new window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // CSS styles specific for printing - updated to match OrderDetailDialog style
    const printStyles = `
      @media print {
        @page {
          margin: 1cm;
          size: portrait;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Improved layout styles similar to OrderDetailDialog */
        .print-page {
          page-break-after: always;
          padding-bottom: 1cm;
        }
        
        .company-header {
          text-align: center;
          margin-bottom: 1cm;
        }
        
        .company-header h2 {
          font-weight: bold;
          font-size: 16pt;
          margin: 0;
        }
        
        .company-header p {
          font-size: 10pt;
          color: #666;
          margin: 5px 0;
        }
        
        .order-date {
          text-align: center;
          margin-bottom: 1cm;
        }
        
        .info-container {
          display: flex;
          margin-bottom: 1cm;
          gap: 0.5cm;
        }
        
        .info-box {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.5cm;
          flex: 1;
        }
        
        .info-box h3 {
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 0.3cm;
          font-size: 12pt;
        }
        
        .order-items {
          margin-bottom: 1cm;
        }
        
        .order-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .order-table th {
          background-color: #f3f4f6;
          padding: 8px;
          text-align: left;
          font-size: 10pt;
          border: 1px solid #ddd;
        }
        
        .order-table td {
          padding: 8px;
          border: 1px solid #ddd;
          font-size: 10pt;
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
          margin-bottom: 0.5cm;
        }
        
        .payment-info {
          text-align: left;
        }
        
        .total-info {
          text-align: right;
        }
        
        .total-value {
          font-weight: bold;
          font-size: 12pt;
        }
        
        .order-notes {
          margin-top: 0.5cm;
        }
        
        .order-notes h3 {
          font-weight: 600;
          margin-bottom: 5px;
          font-size: 11pt;
        }
        
        .footer {
          margin-top: 1cm;
          text-align: center;
          font-size: 9pt;
          color: #666;
        }
        
        /* Hide non-printable elements */
        .no-print {
          display: none !important;
        }
      }`;

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
            ${ordersToPrint.map((order) => {
              const orderCustomer = validCustomers.find(c => c.id === order.customerId);
              return `
                <div class="print-page">
                  ${companyData?.name ? `
                  <div class="company-header">
                    <h2>${companyData.name}</h2>
                    ${companyData.document ? `<p>CNPJ: ${companyData.document}</p>` : ''}
                  </div>
                  ` : ''}
                  
                  <div class="order-date">
                    <p>Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  <div class="info-container">
                    <div class="info-box">
                      <h3>Dados do Cliente</h3>
                      <p><span style="font-weight: 600;">Nome:</span> ${orderCustomer?.name || ''}</p>
                      <p><span style="font-weight: 600;">Telefone:</span> ${orderCustomer?.phone || ''}</p>
                      ${orderCustomer?.document ? `<p><span style="font-weight: 600;">CPF/CNPJ:</span> ${orderCustomer.document}</p>` : ''}
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
                          <th>Produto</th>
                          <th class="text-center">Quantidade</th>
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
                      <p>Subtotal: ${formatCurrency(order.total)}</p>
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
                      <p>${companyData?.name || 'ForcaVendas'} - Sistema de Gestão de Vendas</p>
                      <p>Para qualquer suporte: ${companyData?.phone || '(11) 9999-8888'}</p>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
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
            isPrintDisabled={ordersToPrint.length === 0}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrdersDialog;
