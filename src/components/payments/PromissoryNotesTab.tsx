
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
import { Printer } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { generateMultiplePromissoryNotesHTML } from '@/utils/promissoryNoteRenderer';

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

  // Print multiple promissory notes using unified template
  const handlePrintSelectedNotes = async () => {
    if (selectedOrderIds.length === 0) {
      console.warn("⚠️ Nenhuma nota selecionada para impressão");
      return;
    }

    const ordersToPrint = promissoryOrders.filter(order => 
      selectedOrderIds.includes(order.id)
    );

    // Check if company data is loaded
    const companyData = settings?.company;
    const isCompanyDataLoaded = companyData && 
      companyData.name && 
      companyData.name !== 'Carregando...' && 
      companyData.name.trim() !== '';
    
    if (!isCompanyDataLoaded) {
      console.warn("⏳ Aguardando carregamento dos dados da empresa...");
      return;
    }

    console.log("🖨️ Iniciando impressão de múltiplas notas:", {
      selectedCount: selectedOrderIds.length,
      orderCodes: ordersToPrint.map(o => o.code)
    });

    // Check if running in Electron
    if (window.electronAPI && window.electronAPI.printContent) {
      await handleElectronPrint(ordersToPrint);
    } else {
      handleWebPrint(ordersToPrint);
    }
  };

  const handleElectronPrint = async (ordersToPrint: any[]) => {
    try {
      console.log("🖨️ Usando impressão nativa do Electron para múltiplas notas...");
      const htmlContent = generateMultiplePromissoryNotesHTML(
        ordersToPrint,
        customers,
        paymentTables,
        payments,
        settings?.company
      );
      
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
        console.error('❌ Erro na impressão Electron:', result.error);
        handleWebPrint(ordersToPrint);
      } else {
        console.log('✅ Impressão Electron concluída com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao imprimir com Electron:', error);
      handleWebPrint(ordersToPrint);
    }
  };

  const handleWebPrint = (ordersToPrint: any[]) => {
    console.log("🖨️ Usando impressão web para múltiplas notas...");
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error("❌ Não foi possível abrir janela de impressão");
      return;
    }

    const htmlContent = generateMultiplePromissoryNotesHTML(
      ordersToPrint,
      customers,
      paymentTables,
      payments,
      settings?.company
    );
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          console.log('✅ Impressão web concluída');
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
