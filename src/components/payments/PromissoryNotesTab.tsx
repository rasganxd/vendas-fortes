import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer, PaymentTable } from '@/types';
import PromissoryNoteView from './PromissoryNoteView';
import { Printer, CheckSquare, Square } from 'lucide-react';

interface PromissoryNotesTabProps {
  pendingPaymentOrders: any[];
  paymentTables: PaymentTable[];
  customers: Customer[];
  orders: any[];
  payments: any[];
  highlightedOrderId?: string | null;
}

export default function PromissoryNotesTab({ 
  pendingPaymentOrders, 
  paymentTables, 
  customers, 
  orders, 
  payments, 
  highlightedOrderId 
}: PromissoryNotesTabProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Get only orders that use promissory note payment tables
  const promissoryOrders = orders.filter(order => {
    const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
    const isPromissory = paymentTable?.type === 'promissoria' || paymentTable?.type === 'promissory_note';
    
    console.log('🔍 Checking order for promissory type:', {
      orderId: order.id,
      orderCode: order.code,
      paymentTableId: order.paymentTableId,
      paymentTableName: paymentTable?.name,
      paymentTableType: paymentTable?.type,
      isPromissory
    });
    
    return isPromissory;
  });

  console.log('📋 Promissory orders found:', {
    totalOrders: orders.length,
    promissoryOrdersCount: promissoryOrders.length,
    promissoryOrderCodes: promissoryOrders.map(o => o.code)
  });
  
  // Handle highlighted order from URL parameter
  useEffect(() => {
    if (highlightedOrderId) {
      setSelectedOrderId(highlightedOrderId);
      
      // Scroll the promissory note into view if it exists
      setTimeout(() => {
        const noteElement = document.getElementById(`promissory-note-${highlightedOrderId}`);
        if (noteElement) {
          noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight class
          noteElement.classList.add('highlight-note');
          
          // Remove the highlight class after animation
          setTimeout(() => {
            noteElement.classList.remove('highlight-note');
          }, 3000);
        }
      }, 300);
    }
  }, [highlightedOrderId, promissoryOrders]);

  // Handle individual order selection
  const handleToggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle select all toggle
  const handleSelectAllOrders = () => {
    const allOrderIds = promissoryOrders.map(order => order.id);
    setSelectedOrderIds(prev => 
      prev.length === allOrderIds.length ? [] : allOrderIds
    );
  };

  // Print multiple promissory notes
  const handlePrintSelectedNotes = () => {
    if (selectedOrderIds.length === 0) return;

    const ordersToPrint = promissoryOrders.filter(order => 
      selectedOrderIds.includes(order.id)
    );

    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // CSS styles for compact promissory notes printing
    const printStyles = `
      @media print {
        @page {
          margin: 0.5cm;
          size: A4 portrait;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-size: 10pt;
          line-height: 1.2;
        }
        
        .promissory-note-compact {
          page-break-inside: avoid;
          height: calc(33.33vh - 1cm);
          max-height: 25cm;
          border: 2px solid #000;
          margin-bottom: 0.5cm;
          padding: 0.5cm;
          font-size: 9pt;
          line-height: 1.2;
          background: white;
          width: 100%;
          box-sizing: border-box;
        }
        
        .promissory-note-compact:nth-child(3n) {
          page-break-after: always;
        }
        
        .promissory-note-compact:last-child {
          page-break-after: avoid;
        }
        
        .note-header {
          text-align: center;
          margin-bottom: 0.5cm;
        }
        
        .note-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 0.2cm;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 0.1cm;
        }
        
        .note-content {
          line-height: 1.3;
          font-size: 9pt;
          text-align: justify;
        }
        
        .note-value {
          font-size: 11pt;
          font-weight: bold;
        }
        
        .signature-section {
          margin-top: 1cm;
          text-align: center;
        }
        
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin: 0.5cm auto 0.2cm auto;
        }
        
        .customer-info {
          font-size: 8pt;
          margin: 0.2cm 0;
        }
        
        .footer-info {
          font-size: 7pt;
          text-align: center;
          margin-top: 0.3cm;
          color: #666;
        }
        
        .no-print {
          display: none !important;
        }
      }`;

    // Generate compact promissory note HTML
    const generateCompactPromissoryNoteHTML = (order: any) => {
      const customer = customers.find(c => c.id === order.customerId);
      const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
      const orderPayments = payments.filter(p => p.orderId === order.id);
      
      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      const formatDate = (date: Date) => 
        new Date(date).toLocaleDateString('pt-BR');

      const dueDate = orderPayments.length > 0 && orderPayments[0].dueDate 
        ? new Date(orderPayments[0].dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      return `
        <div class="promissory-note-compact">
          <div class="note-header">
            <div class="note-title">NOTA PROMISSÓRIA</div>
            <p style="margin: 0.1cm 0; font-size: 8pt;">Nº ${order.code || 'N/A'} - <span class="note-value">${formatCurrency(order.total)}</span></p>
          </div>
          
          <div class="note-content">
            <p style="margin: 0.1cm 0;">Aos <strong>${formatDate(dueDate)}</strong>, pagarei por esta única via de NOTA PROMISSÓRIA a <strong>${paymentTable?.payableTo || 'BENEFICIÁRIO'}</strong>, ou à sua ordem, a quantia de <span class="note-value">${formatCurrency(order.total)}</span>, em moeda corrente deste país.</p>
            
            <p style="margin: 0.1cm 0;">Referente ao pedido nº <strong>${order.code}</strong> realizado em <strong>${formatDate(order.createdAt)}</strong>.</p>
            
            ${paymentTable?.paymentLocation ? `<p style="margin: 0.1cm 0;">Pagável em: <strong>${paymentTable.paymentLocation}</strong></p>` : ''}
            
            <div class="customer-info">
              <p style="margin: 0.05cm 0;"><strong>Nome:</strong> ${customer?.name || order.customerName}</p>
              ${customer?.document ? `<p style="margin: 0.05cm 0;"><strong>CPF/CNPJ:</strong> ${customer.document}</p>` : ''}
              ${customer?.address ? `<p style="margin: 0.05cm 0;"><strong>Endereço:</strong> ${customer.address}, ${customer.city || ''} - ${customer.state || ''}</p>` : ''}
            </div>
          </div>
          
          <div class="signature-section">
            <p style="margin: 0; font-size: 8pt;">${paymentTable?.paymentLocation || '___________________'}, ${formatDate(new Date())}</p>
            <div class="signature-line"></div>
            <p style="margin: 0.1cm 0; font-size: 8pt;"><strong>${customer?.name || order.customerName}</strong></p>
            <p style="margin: 0; font-size: 7pt;">Assinatura do Devedor</p>
          </div>
          
          <div class="footer-info">
            <p style="margin: 0;">Este documento não tem valor fiscal - Apenas para controle interno</p>
          </div>
        </div>
      `;
    };

    // Write HTML content to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impressão de Notas Promissórias Compactas</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${ordersToPrint.map(order => generateCompactPromissoryNoteHTML(order)).join('')}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
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
  
  // If no orders found
  if (promissoryOrders.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Nenhuma nota promissória encontrada.</p>
        <p className="text-sm text-gray-400 mt-2">
          Notas promissórias são geradas automaticamente quando pedidos são criados
          com tabelas de pagamento do tipo "Promissória".
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Debug: {orders.length} pedidos total, {paymentTables.length} tabelas de pagamento
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedOrderIds.length === promissoryOrders.length && promissoryOrders.length > 0}
              onCheckedChange={handleSelectAllOrders}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              Selecionar todas ({selectedOrderIds.length} de {promissoryOrders.length})
            </span>
          </div>
          
          {selectedOrderIds.length > 0 && (
            <Button 
              onClick={handlePrintSelectedNotes}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Selecionadas ({selectedOrderIds.length})
            </Button>
          )}
        </div>

        <label className="block text-sm font-medium mb-2">Filtrar por Pedido</label>
        <Select
          value={selectedOrderId || 'all'}
          onValueChange={(value) => setSelectedOrderId(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um pedido para filtrar ou deixe vazio para ver todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mostrar todas as notas</SelectItem>
            {promissoryOrders.map(order => (
              <SelectItem key={order.id} value={order.id}>
                #{order.code || '---'} - {order.customerName} 
                ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-10">
        {promissoryOrders
          .filter(order => !selectedOrderId || order.id === selectedOrderId)
          .map(order => {
            const customer = customers.find(c => c.id === order.customerId) || null;
            const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
            
            return (
              <div 
                key={order.id} 
                id={`promissory-note-${order.id}`} 
                className="bg-white p-4 border rounded-md shadow transition-all"
              >
                <div className="flex items-center mb-4">
                  <Checkbox
                    checked={selectedOrderIds.includes(order.id)}
                    onCheckedChange={() => handleToggleOrderSelection(order.id)}
                    className="mr-3"
                  />
                  <h3 className="text-lg font-semibold">
                    Nota Promissória - Pedido #{order.code}
                  </h3>
                </div>
                
                <PromissoryNoteView
                  order={order}
                  customer={customer}
                  paymentTable={paymentTable}
                  payments={payments.filter(p => p.orderId === order.id)}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
