
import React, { useState, useEffect } from 'react';
import { Order, Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import CustomerSelect from './print/CustomerSelect';
import PrintDialogActions from './print/PrintDialogActions';
import PrintableOrderContent from './print/PrintableOrderContent';

interface PrintOrdersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  customers: Customer[];
  selectedOrderIds: string[];
  setSelectedOrderIds: (ids: string[]) => void;
  filteredOrders: Order[];
  formatCurrency: (value: number | undefined) => string;
}

const PrintOrdersDialog: React.FC<PrintOrdersDialogProps> = ({
  isOpen,
  onOpenChange,
  orders,
  customers,
  selectedOrderIds,
  setSelectedOrderIds,
  filteredOrders,
  formatCurrency
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [ordersToPrint, setOrdersToPrint] = useState<Order[]>([]);
  
  // Ensure customers array is valid
  const validCustomers = customers.filter(customer => customer && customer.id);

  useEffect(() => {
    if (selectedOrderIds.length > 0) {
      setOrdersToPrint(orders.filter(order => selectedOrderIds.includes(order.id)));
    } else {
      const filtered = selectedCustomerId === "all" 
        ? filteredOrders 
        : filteredOrders.filter(order => order.customerId === selectedCustomerId);
      setOrdersToPrint(filtered);
    }
  }, [selectedOrderIds, selectedCustomerId, orders, filteredOrders]);
  
  // Nova função para imprimir em uma janela separada
  const handlePrintInNewWindow = () => {
    // Cria uma nova janela
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Estilos CSS específicos para impressão
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
        
        /* Layout de grade para dois pedidos por página */
        .print-orders-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5cm;
          width: 100%;
        }
        
        /* Cada pedido ocupa seu próprio espaço com tamanho fixo */
        .print-order {
          width: 100%;
          page-break-inside: avoid;
          box-sizing: border-box;
          padding: 0.3cm;
          border: 1px solid #ddd;
          font-size: 10pt;
          height: 13cm;
          max-height: 13cm;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        /* Forçar quebra de página a cada dois pedidos */
        .print-order:nth-child(2n) {
          page-break-after: always;
        }
        
        /* Estilos para tabelas */
        .print-order table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
        }
        
        .print-order table th,
        .print-order table td {
          padding: 2px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        .print-order h1 {
          font-size: 12pt;
          margin: 0 0 4px 0;
        }
        
        .print-order h2 {
          font-size: 10pt;
          margin: 0 0 3px 0;
        }
        
        .print-order p {
          margin: 2px 0;
          font-size: 8pt;
        }
      }
      
      /* Estilos para visualização na tela (não para impressão) */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 1cm;
      }
    `;

    // Escreve o conteúdo HTML na nova janela
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
              const orderCustomer = customers.find(c => c.id === order.customerId);
              return `
                <div class="print-order">
                  <div style="text-align: center; margin-bottom: 0.3cm;">
                    <h1>${order.customerName || 'Empresa'}</h1>
                    <p>Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  <div style="border: 1px solid #ddd; border-radius: 3px; margin-bottom: 0.2cm; padding: 0.2cm;">
                    <h2 style="margin-bottom: 0.1cm;">Cliente</h2>
                    <p><span style="font-weight: 600;">Nome:</span> ${orderCustomer?.name || ''}</p>
                    <p><span style="font-weight: 600;">Tel:</span> ${orderCustomer?.phone || ''}</p>
                    ${orderCustomer?.document ? `<p><span style="font-weight: 600;">CPF/CNPJ:</span> ${orderCustomer.document}</p>` : ''}
                  </div>
                  
                  ${(orderCustomer?.address || order.deliveryAddress) ? `
                  <div style="border: 1px solid #ddd; border-radius: 3px; margin-bottom: 0.2cm; padding: 0.2cm;">
                    <h2 style="margin-bottom: 0.1cm;">Endereço de Entrega</h2>
                    <p>
                      ${order.deliveryAddress || orderCustomer?.address || ''}
                      ${(order.deliveryCity || orderCustomer?.city) ? `, ${order.deliveryCity || orderCustomer?.city}` : ''}
                      ${(order.deliveryState || orderCustomer?.state) ? ` - ${order.deliveryState || orderCustomer?.state}` : ''}
                    </p>
                  </div>
                  ` : ''}
                  
                  <div style="margin-bottom: 0.2cm;">
                    <h2 style="margin-bottom: 0.1cm;">Itens do Pedido</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f3f4f6;">
                          <th style="border: 1px solid #ddd; padding: 0.1cm; text-align: left;">Produto</th>
                          <th style="border: 1px solid #ddd; padding: 0.1cm; text-align: center;">Qtd</th>
                          <th style="border: 1px solid #ddd; padding: 0.1cm; text-align: right;">Preço</th>
                          <th style="border: 1px solid #ddd; padding: 0.1cm; text-align: right;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.items.map(item => `
                          <tr>
                            <td style="border: 1px solid #ddd; padding: 0.1cm;">${item.productName}</td>
                            <td style="border: 1px solid #ddd; padding: 0.1cm; text-align: center;">${item.quantity}</td>
                            <td style="border: 1px solid #ddd; padding: 0.1cm; text-align: right;">${formatCurrency(item.unitPrice)}</td>
                            <td style="border: 1px solid #ddd; padding: 0.1cm; text-align: right;">${formatCurrency(item.total)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                  
                  <div style="display: flex; justify-content: flex-end; margin-bottom: 0.2cm;">
                    <div style="text-align: right;">
                      <p style="font-weight: 700;">Total: ${formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  
                  ${order.notes ? `
                  <div style="margin-bottom: 0.2cm;">
                    <p style="font-weight: 500;">Obs:</p>
                    <p>${order.notes}</p>
                  </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin-top: auto; padding-top: 0.1cm; border-top: 1px solid #ddd;">
                    <p>Sistema de Gestão de Vendas</p>
                  </div>
                </div>
              `;
            }).join('')}
            </div>
          </div>
          <script>
            // Aciona a impressão quando o conteúdo estiver carregado
            window.onload = function() {
              setTimeout(() => {
                window.print();
                // Fecha a janela quando a impressão for cancelada ou finalizada
                // ou caso a impressão não inicie após 2 segundos
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
