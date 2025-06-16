
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
import PromissoryNoteTemplate from './PromissoryNoteTemplate';
import { Printer, CheckSquare, Square } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

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
  const { settings } = useAppContext();
  
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

  // Generate unified HTML for multiple promissory notes
  const generateUnifiedPromissoryNotesHTML = (ordersToPrint: any[]) => {
    const companyData = settings?.company;
    
    // Generate each promissory note using the unified template
    const promissoryNotesHTML = ordersToPrint.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
      const orderPayments = payments.filter(p => p.orderId === order.id);
      
      // Create a temporary container to render the React component as HTML
      const tempDiv = document.createElement('div');
      tempDiv.className = 'promissory-note-compact';
      
      // Use the same template structure but as static HTML
      const totalPaid = orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = order.total - totalPaid;
      
      // Calculate due date
      const calculateDueDate = () => {
        if (!paymentTable || !paymentTable.terms || paymentTable.terms.length === 0) {
          const orderDate = new Date(order.date);
          const dueDate = new Date(orderDate);
          dueDate.setDate(orderDate.getDate() + 30);
          return dueDate;
        }
        
        const firstTerm = paymentTable.terms[0];
        const orderDate = new Date(order.date);
        const dueDate = new Date(orderDate);
        dueDate.setDate(orderDate.getDate() + (firstTerm.days || 30));
        return dueDate;
      };
      
      const payment = orderPayments.length > 0 ? orderPayments[0] : {
        amount: remainingAmount,
        dueDate: calculateDueDate(),
        date: order.date,
        customerName: customer?.name || order.customerName,
        customerDocument: customer?.document,
        customerAddress: customer?.address
      };

      if (orderPayments.length === 0) {
        payment.dueDate = calculateDueDate();
      }

      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      const formatDate = (date: Date | string) => 
        new Date(date).toLocaleDateString('pt-BR');

      const formatCurrencyInWords = (value: number) => {
        // Simple implementation - you might want to use a proper library
        return `${formatCurrency(value)} por extenso`;
      };

      return `
        <div class="promissory-note-compact">
          ${companyData?.name && companyData.name !== 'Carregando...' ? `
            <div class="text-center mb-3">
              <h2 class="font-bold text-sm">${companyData.name}</h2>
              ${companyData.document ? `<p class="text-gray-600 text-xs">CNPJ: ${companyData.document}</p>` : ''}
              ${companyData.address ? `<p class="text-gray-600 text-xs">${companyData.address}</p>` : ''}
            </div>
          ` : ''}

          <div class="text-center mb-3">
            <h1 class="font-bold uppercase border-b border-t border-gray-800 py-2 text-lg">NOTA PROMISSÓRIA</h1>
            <p class="mt-2 text-right text-sm">
              <span class="font-semibold">Valor:</span> ${formatCurrency(remainingAmount || payment.amount || 0)}
            </p>
          </div>

          <div class="text-justify leading-relaxed mb-3 text-sm leading-tight">
            <p class="mb-2">
              Aos <span class="font-semibold">${formatDate(payment.dueDate || new Date())}</span>,
              pagarei por esta única via de NOTA PROMISSÓRIA a ${companyData?.name || "___________________"},
              ou à sua ordem, a quantia de ${formatCurrency(remainingAmount || payment.amount || 0)} (${payment.amountInWords || formatCurrencyInWords(remainingAmount || payment.amount)}),
              em moeda corrente deste país.
            </p>
            <p class="text-sm">
              Pagável em ${paymentTable?.paymentLocation || payment.paymentLocation || "___________________"}
            </p>
          </div>

          <div class="mb-3 text-xs">
            <p><span class="font-semibold">Nome:</span> ${customer?.name || payment.customerName || "___________________"}</p>
            ${(customer?.document || payment.customerDocument) ? `<p><span class="font-semibold">CPF/CNPJ:</span> ${customer?.document || payment.customerDocument}</p>` : ''}
            ${(customer?.address || payment.customerAddress) ? `<p><span class="font-semibold">Endereço:</span> ${customer?.address || payment.customerAddress}</p>` : ''}
          </div>

          <div class="mb-3 text-xs">
            <p><span class="font-semibold">Referente ao pedido:</span> #${order.code || order.id}</p>
            <p><span class="font-semibold">Data do pedido:</span> ${formatDate(order.date)}</p>
            ${paymentTable ? `<p><span class="font-semibold">Forma de pagamento:</span> ${paymentTable.name}</p>` : ''}
            ${order.notes ? `<p><span class="font-semibold">Observações:</span> ${order.notes}</p>` : ''}
          </div>

          <div class="mt-6">
            <p class="text-right mb-1 text-xs">
              ${paymentTable?.paymentLocation || payment.emissionLocation || "___________________"}, ${formatDate(payment.date || order.date || new Date())}
            </p>
            <div class="border-t border-gray-400 pt-2 text-center mt-8">
              <p class="text-xs">Assinatura do Devedor</p>
            </div>
          </div>

          <div class="text-center text-gray-500 mt-6 text-xs">
            ${companyData?.footer ? `<p>${companyData.footer}</p>` : '<p>Este documento não tem valor fiscal - Apenas para controle interno</p>'}
          </div>
        </div>
      `;
    }).join('');

    // CSS styles for print
    const printStyles = `
      <style>
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
          
          .promissory-note-compact h1 {
            font-size: 14pt;
            font-weight: 700;
            margin: 0.2cm 0;
            padding: 0.1cm;
          }
          
          .promissory-note-compact h2 {
            font-size: 11pt;
            font-weight: 600;
            margin: 0.1cm 0;
          }
          
          .promissory-note-compact p {
            margin: 0.1cm 0;
            font-size: 9pt;
          }
          
          .promissory-note-compact .text-xs {
            font-size: 8pt;
          }
          
          .promissory-note-compact .text-sm {
            font-size: 9pt;
          }
          
          .promissory-note-compact .border-t {
            margin-top: 1cm;
            padding-top: 0.2cm;
          }
          
          .promissory-note-compact .mb-3 {
            margin-bottom: 0.2cm;
          }
          
          .promissory-note-compact .mb-6 {
            margin-bottom: 0.3cm;
          }
          
          .promissory-note-compact .mt-6 {
            margin-top: 0.3cm;
          }
          
          .promissory-note-compact .mt-8 {
            margin-top: 0.5cm;
          }
          
          .promissory-note-compact * {
            max-width: 100%;
            word-wrap: break-word;
          }
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impressão de Notas Promissórias</title>
          ${printStyles}
        </head>
        <body>
          ${promissoryNotesHTML}
        </body>
      </html>
    `;
  };

  // Print multiple promissory notes using unified template
  const handlePrintSelectedNotes = async () => {
    if (selectedOrderIds.length === 0) return;

    const ordersToPrint = promissoryOrders.filter(order => 
      selectedOrderIds.includes(order.id)
    );

    // Check if company data is loaded
    const companyData = settings?.company;
    const isCompanyDataLoaded = companyData && companyData.name && companyData.name !== 'Carregando...';
    
    if (!isCompanyDataLoaded) {
      console.warn("Aguardando carregamento dos dados da empresa...");
      return;
    }

    // Check if running in Electron
    if (window.electronAPI && window.electronAPI.printContent) {
      // Use native Electron printing
      await handleElectronPrint(ordersToPrint);
    } else {
      // Fallback for web
      handleWebPrint(ordersToPrint);
    }
  };

  const handleElectronPrint = async (ordersToPrint: any[]) => {
    try {
      const htmlContent = generateUnifiedPromissoryNotesHTML(ordersToPrint);
      const result = await window.electronAPI.printContent(htmlContent, {
        printBackground: true,
        color: true,
        margins: {
          marginType: 'custom',
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5
        }
      });
      
      if (!result.success) {
        console.error('Erro na impressão:', result.error);
      }
    } catch (error) {
      console.error('Erro ao imprimir com Electron:', error);
      // Fallback para impressão web
      handleWebPrint(ordersToPrint);
    }
  };

  const handleWebPrint = (ordersToPrint: any[]) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const htmlContent = generateUnifiedPromissoryNotesHTML(ordersToPrint);
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
