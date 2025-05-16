
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
import PrintableOrderContent from './print/PrintableOrderContent';

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
  
  // Function to print in a new window
  const handlePrintInNewWindow = () => {
    // Create a new window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // CSS styles specific for printing
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
        
        /* Vertical layout for orders one above the other */
        .print-orders-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 0.5cm;
        }
        
        /* Each order takes its own space, no fixed height to avoid cuts */
        .print-order {
          width: 100%;
          page-break-inside: avoid;
          box-sizing: border-box;
          padding: 0.3cm;
          border: 1px solid #ddd;
          font-size: 11pt;
          margin-bottom: 0.3cm;
          display: flex;
          flex-direction: column;
        }
        
        /* Force page break every 2 orders */
        .print-order:nth-child(2n) {
          page-break-after: always;
        }
        
        /* More compact styles for tables */
        .print-order table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          margin: 0.15cm 0;
        }
        
        .print-order table th,
        .print-order table td {
          padding: 3px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        .print-order h1 {
          font-size: 12pt;
          margin: 0 0 4px 0;
        }
        
        .print-order h2 {
          font-size: 11pt;
          margin: 0 0 2px 0;
        }
        
        .print-order p {
          margin: 2px 0;
          font-size: 10pt;
          line-height: 1.3;
        }
        
        /* Reduce spacing between sections */
        .print-order .section {
          margin-bottom: 0.15cm;
        }
        
        /* Hide non-printable elements */
        .no-print, button, .no-print {
          display: none !important;
        }
        
        /* Ensure content is visible during printing */
        .hidden.print\\:block {
          display: block !important;
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
            <div class="print-orders-container">
            ${ordersToPrint.map((order, index) => {
              const orderCustomer = validCustomers.find(c => c.id === order.customerId);
              return `
                <div class="print-order">
                  <div style="text-align: center; margin-bottom: 0.15cm;">
                    <h1>${order.customerName || 'Empresa'}</h1>
                    <p>Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  <div style="border: 1px solid #ddd; border-radius: 3px; margin-bottom: 0.15cm; padding: 0.15cm;" class="section">
                    <h2 style="margin-bottom: 0.1cm;">Cliente</h2>
                    <p><span style="font-weight: 600;">Nome:</span> ${orderCustomer?.name || ''}</p>
                    <p><span style="font-weight: 600;">Tel:</span> ${orderCustomer?.phone || ''}</p>
                    ${orderCustomer?.document ? `<p><span style="font-weight: 600;">CPF/CNPJ:</span> ${orderCustomer.document}</p>` : ''}
                  </div>
                  
                  ${(orderCustomer?.address || order.deliveryAddress) ? `
                  <div style="border: 1px solid #ddd; border-radius: 3px; margin-bottom: 0.15cm; padding: 0.15cm;" class="section">
                    <h2 style="margin-bottom: 0.1cm;">Endereço de Entrega</h2>
                    <p>
                      ${order.deliveryAddress || orderCustomer?.address || ''}
                      ${(order.deliveryCity || orderCustomer?.city) ? `, ${order.deliveryCity || orderCustomer?.city}` : ''}
                      ${(order.deliveryState || orderCustomer?.state) ? ` - ${order.deliveryState || orderCustomer?.state}` : ''}
                    </p>
                  </div>
                  ` : ''}
                  
                  <div style="margin-bottom: 0.15cm;" class="section">
                    <h2 style="margin-bottom: 0.1cm;">Itens do Pedido</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f3f4f6;">
                          <th style="border: 1px solid #ddd; padding: 3px; text-align: left;">Produto</th>
                          <th style="border: 1px solid #ddd; padding: 3px; text-align: center;">Qtd</th>
                          <th style="border: 1px solid #ddd; padding: 3px; text-align: right;">Preço</th>
                          <th style="border: 1px solid #ddd; padding: 3px; text-align: right;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.items && Array.isArray(order.items) ? order.items.map(item => `
                          <tr>
                            <td style="border: 1px solid #ddd; padding: 3px;">${item.productName}</td>
                            <td style="border: 1px solid #ddd; padding: 3px; text-align: center;">${item.quantity}</td>
                            <td style="border: 1px solid #ddd; padding: 3px; text-align: right;">${formatCurrency(item.unitPrice)}</td>
                            <td style="border: 1px solid #ddd; padding: 3px; text-align: right;">${formatCurrency(item.total)}</td>
                          </tr>
                        `).join('') : ''}
                      </tbody>
                    </table>
                  </div>
                  
                  <div style="display: flex; justify-content: flex-end; margin-bottom: 0.15cm;" class="section">
                    <div style="text-align: right;">
                      <p style="font-weight: 700; font-size: 11pt;">Total: ${formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  
                  ${order.notes ? `
                  <div style="margin-bottom: 0.15cm;" class="section">
                    <p style="font-weight: 500;">Obs:</p>
                    <p>${order.notes}</p>
                  </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin-top: auto; padding-top: 0.1cm; border-top: 1px solid #ddd;" class="section">
                    <p>Sistema de Gestão de Vendas</p>
                  </div>
                </div>
              `;
            }).join('')}
            </div>
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
