
import React, { useRef } from 'react';
import { Customer, Payment, PaymentTable } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { formatCurrency, formatCurrencyInWords } from '@/lib/format-utils';
import { useAppContext } from '@/hooks/useAppContext';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import '@/styles/promissory-notes.css';

interface PromissoryNoteViewProps {
  order: any;
  customer: Customer | null;
  paymentTable: PaymentTable | undefined;
  payments: any[];
  highlight?: boolean;
}

const PromissoryNoteView: React.FC<PromissoryNoteViewProps> = ({ 
  order, 
  customer, 
  paymentTable, 
  payments,
  highlight = false
}) => {
  const { settings } = useAppContext();
  const companyData = settings?.company;
  const printRef = useRef<HTMLDivElement>(null);

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nota_Promissoria_${order.code || ''}`,
    onBeforePrint: () => console.log("Preparando para imprimir..."),
    onAfterPrint: () => console.log("Impressão concluída"),
  });

  // Calculate total payments
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = order.total - totalPaid;
  
  // Calculate correct due date based on payment table terms
  const calculateDueDate = () => {
    if (!paymentTable || !paymentTable.terms || paymentTable.terms.length === 0) {
      // Fallback: if no terms, use installments or default to 30 days
      const installments = paymentTable?.installments || [];
      if (installments.length > 0) {
        const orderDate = new Date(order.date);
        const dueDate = new Date(orderDate);
        dueDate.setDate(orderDate.getDate() + (installments[0].days || 30));
        return dueDate;
      }
      // Default to 30 days from order date
      const orderDate = new Date(order.date);
      const dueDate = new Date(orderDate);
      dueDate.setDate(orderDate.getDate() + 30);
      return dueDate;
    }
    
    // Use the first term to calculate due date
    const firstTerm = paymentTable.terms[0];
    const orderDate = new Date(order.date);
    const dueDate = new Date(orderDate);
    dueDate.setDate(orderDate.getDate() + (firstTerm.days || 30));
    
    console.log('🗓️ Calculating due date for promissory note:', {
      orderDate: orderDate.toISOString(),
      termDays: firstTerm.days,
      calculatedDueDate: dueDate.toISOString()
    });
    
    return dueDate;
  };
  
  // Use the first payment for the promissory note details, or create defaults if no payments
  const payment = payments.length > 0 ? payments[0] : {
    amount: remainingAmount,
    dueDate: calculateDueDate(),
    date: order.date,
    customerName: customer?.name || order.customerName,
    customerDocument: customer?.document,
    customerAddress: customer?.address
  };

  // Override the due date with our calculated one if using fallback payment
  if (payments.length === 0) {
    payment.dueDate = calculateDueDate();
  }

  return (
    <div className="relative">
      {/* Print Button */}
      <div className="absolute top-1 right-1 print:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint} 
          className="flex items-center gap-1 text-xs px-2 py-1"
        >
          <Printer className="h-3 w-3" />
          <span>Imprimir</span>
        </Button>
      </div>

      {/* Promissory Note Content - More Compact */}
      <div 
        ref={printRef} 
        className={`promissory-note-compact p-3 max-w-xl mx-auto ${highlight ? 'highlight-note border-2 rounded-md' : ''}`}
      >
        {/* Company Header - Compact */}
        {companyData?.name && (
          <div className="text-center mb-3">
            <h2 className="font-bold text-sm">{companyData.name}</h2>
            {companyData.document && (
              <p className="text-xs text-gray-600">CNPJ: {companyData.document}</p>
            )}
            {companyData.address && (
              <p className="text-xs text-gray-600">{companyData.address}</p>
            )}
          </div>
        )}

        {/* Title - Compact */}
        <div className="text-center mb-3">
          <h1 className="text-lg font-bold uppercase border-b border-t border-gray-800 py-1">
            NOTA PROMISSÓRIA
          </h1>
          <p className="mt-1 text-right text-sm">
            <span className="font-semibold">Valor:</span> {formatCurrency(remainingAmount || payment.amount || 0)}
          </p>
        </div>

        {/* Main Content - Compact */}
        <div className="mb-3 text-justify text-sm leading-tight">
          <p className="mb-2">
            Aos <span className="font-semibold">{formatDateToBR(payment.dueDate || new Date())}</span>,
            pagarei por esta única via de NOTA PROMISSÓRIA a {companyData?.name || "___________________"},
            ou à sua ordem, a quantia de {formatCurrency(remainingAmount || payment.amount || 0)} ({payment.amountInWords || formatCurrencyInWords(remainingAmount || payment.amount)}),
            em moeda corrente deste país.
          </p>
          <p className="text-sm">
            Pagável em {paymentTable?.paymentLocation || payment.paymentLocation || "___________________"}
          </p>
        </div>

        {/* Customer Info - Compact */}
        <div className="mb-3 text-xs">
          <p><span className="font-semibold">Nome:</span> {customer?.name || payment.customerName || "___________________"}</p>
          {(customer?.document || payment.customerDocument) && (
            <p><span className="font-semibold">CPF/CNPJ:</span> {customer?.document || payment.customerDocument}</p>
          )}
          {(customer?.address || payment.customerAddress) && (
            <p><span className="font-semibold">Endereço:</span> {customer?.address || payment.customerAddress}</p>
          )}
        </div>

        {/* Payment Details - Compact */}
        <div className="mb-3 text-xs">
          <p><span className="font-semibold">Referente ao pedido:</span> #{order.code || order.id}</p>
          <p><span className="font-semibold">Data do pedido:</span> {formatDateToBR(order.date)}</p>
          {paymentTable && (
            <p><span className="font-semibold">Forma de pagamento:</span> {paymentTable.name}</p>
          )}
          {order.notes && (
            <p><span className="font-semibold">Observações:</span> {order.notes}</p>
          )}
        </div>

        {/* Signatures - Compact */}
        <div className="mt-6">
          <p className="text-right mb-1 text-xs">
            {paymentTable?.paymentLocation || payment.emissionLocation || "___________________"}, {formatDateToBR(payment.date || order.date || new Date())}
          </p>
          <div className="border-t border-gray-400 pt-1 mt-8 text-center">
            <p className="text-xs">Assinatura do Emitente</p>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="mt-6 text-center text-xs text-gray-500">
          {companyData?.footer ? (
            <p>{companyData.footer}</p>
          ) : (
            <p>Este documento não tem valor fiscal - Apenas para controle interno</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromissoryNoteView;
