
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
  
  // Use the first payment for the promissory note details, or create defaults if no payments
  const payment = payments.length > 0 ? payments[0] : {
    amount: remainingAmount,
    dueDate: order.dueDate,
    date: order.date,
    customerName: customer?.name || order.customerName,
    customerDocument: customer?.document,
    customerAddress: customer?.address
  };

  return (
    <div className="relative">
      {/* Print Button */}
      <div className="absolute top-2 right-2 print:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint} 
          className="flex items-center gap-1"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir</span>
        </Button>
      </div>

      {/* Promissory Note Content */}
      <div 
        ref={printRef} 
        className={`p-4 max-w-2xl mx-auto ${highlight ? 'highlight-note border-2 rounded-md' : ''}`}
      >
        {/* Company Header */}
        {companyData?.name && (
          <div className="text-center mb-6">
            <h2 className="font-bold text-xl">{companyData.name}</h2>
            {companyData.document && (
              <p className="text-sm text-gray-600">CNPJ: {companyData.document}</p>
            )}
            {companyData.address && (
              <p className="text-sm text-gray-600">{companyData.address}</p>
            )}
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase border-b-2 border-t-2 border-gray-800 py-2">
            NOTA PROMISSÓRIA
          </h1>
          <p className="mt-2 text-right">
            <span className="font-semibold">Valor:</span> {formatCurrency(remainingAmount || payment.amount || 0)}
          </p>
        </div>

        {/* Main Content */}
        <div className="mb-6 text-justify">
          <p className="mb-4">
            Aos <span className="font-semibold">{formatDateToBR(payment.dueDate || order.dueDate || new Date())}</span>,
            pagarei por esta única via de NOTA PROMISSÓRIA a {companyData?.name || "___________________"},
            ou à sua ordem, a quantia de {formatCurrency(remainingAmount || payment.amount || 0)} ({payment.amountInWords || formatCurrencyInWords(remainingAmount || payment.amount)}),
            em moeda corrente deste país.
          </p>
          <p>
            Pagável em {paymentTable?.paymentLocation || payment.paymentLocation || "___________________"}
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12">
          <p className="text-right mb-2">
            {paymentTable?.paymentLocation || payment.emissionLocation || "___________________"}, {formatDateToBR(payment.date || order.date || new Date())}
          </p>
          <div className="border-t border-gray-400 pt-2 mt-16 text-center">
            <p>Assinatura do Emitente</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-8">
          <p><span className="font-semibold">Nome:</span> {customer?.name || payment.customerName || "___________________"}</p>
          {(customer?.document || payment.customerDocument) && (
            <p><span className="font-semibold">CPF/CNPJ:</span> {customer?.document || payment.customerDocument}</p>
          )}
          {(customer?.address || payment.customerAddress) && (
            <p><span className="font-semibold">Endereço:</span> {customer?.address || payment.customerAddress}</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="mt-8 text-sm">
          <p><span className="font-semibold">Referente ao pedido:</span> #{order.code || order.id}</p>
          {order.notes && (
            <p><span className="font-semibold">Observações:</span> {order.notes}</p>
          )}
          {payment.installments && Array.isArray(payment.installments) && payment.installments.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Parcelas:</p>
              <ul className="list-disc pl-5">
                {payment.installments.map((installment, index) => (
                  <li key={index}>
                    {formatDateToBR(installment.dueDate || new Date())}: {formatCurrency(installment.amount)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500">
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
