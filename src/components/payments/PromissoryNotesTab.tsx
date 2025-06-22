
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
import { DatePeriod } from '@/types/dateFilter';
import PromissoryNoteView from './PromissoryNoteView';
import OrdersDateFilter from '@/components/orders/OrdersDateFilter';
import { Printer } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrdersDateFilter } from '@/hooks/useOrdersDateFilter';
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
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('all');
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

  // Use the existing date filter hook
  const { periodCounts, filterOrdersByPeriod } = useOrdersDateFilter(promissoryOrders);

  // Apply date period filter
  const dateFilteredOrders = filterOrdersByPeriod(promissoryOrders, selectedPeriod);

  // Apply order-specific filter if selected
  const filteredOrders = selectedOrderId 
    ? dateFilteredOrders.filter(order => order.id === selectedOrderId)
    : dateFilteredOrders;

  console.log('📋 Promissory orders found:', {
    totalOrders: orders.length,
    promissoryOrdersCount: promissoryOrders.length,
    dateFilteredCount: dateFilteredOrders.length,
    finalFilteredCount: filteredOrders.length,
    selectedPeriod,
    selectedOrderId,
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

  // Handle select all toggle (only for currently filtered orders)
  const handleSelectAllOrders = () => {
    const allFilteredOrderIds = filteredOrders.map(order => order.id);
    const allSelected = allFilteredOrderIds.every(id => selectedOrderIds.includes(id));
    
    if (allSelected) {
      // Remove all filtered orders from selection
      setSelectedOrderIds(prev => prev.filter(id => !allFilteredOrderIds.includes(id)));
    } else {
      // Add all filtered orders to selection
      setSelectedOrderIds(prev => [...new Set([...prev, ...allFilteredOrderIds])]);
    }
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

  // Check if selected orders are in filtered results
  const selectedOrdersInFiltered = selectedOrderIds.filter(id => 
    filteredOrders.some(order => order.id === id)
  );
  const allFilteredSelected = filteredOrders.length > 0 && 
    filteredOrders.every(order => selectedOrderIds.includes(order.id));
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={allFilteredSelected}
              onCheckedChange={handleSelectAllOrders}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              Selecionar todas visíveis ({selectedOrdersInFiltered.length} de {filteredOrders.length})
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

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date Period Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Filtrar por Período</label>
            <OrdersDateFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              periodCounts={periodCounts}
            />
          </div>

          {/* Order Specific Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Filtrar por Pedido</label>
            <Select
              value={selectedOrderId || 'all'}
              onValueChange={(value) => setSelectedOrderId(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um pedido específico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mostrar todos os pedidos filtrados</SelectItem>
                {dateFilteredOrders.map(order => (
                  <SelectItem key={order.id} value={order.id}>
                    #{order.code || '---'} - {order.customerName} 
                    ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Summary */}
        {(selectedPeriod !== 'all' || selectedOrderId) && (
          <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center gap-4">
              <span>
                📊 Filtros ativos: 
                {selectedPeriod !== 'all' && (
                  <span className="ml-1 px-2 py-1 bg-blue-100 rounded text-xs">
                    {selectedPeriod === 'today' && 'Hoje'}
                    {selectedPeriod === 'yesterday' && 'Ontem'}
                    {selectedPeriod === 'this_week' && 'Esta semana'}
                    {selectedPeriod === 'last_week' && 'Semana passada'}
                    {selectedPeriod === 'this_month' && 'Este mês'}
                    {selectedPeriod === 'last_month' && 'Mês passado'}
                  </span>
                )}
                {selectedOrderId && (
                  <span className="ml-1 px-2 py-1 bg-green-100 rounded text-xs">
                    Pedido específico
                  </span>
                )}
              </span>
              <span>
                Exibindo {filteredOrders.length} de {promissoryOrders.length} notas
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-10">
        {filteredOrders.map(order => {
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
