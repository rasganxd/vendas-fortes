
import React from 'react';
import { Customer, Order, PaymentTable } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { formatCurrency, formatCurrencyInWords } from '@/lib/format-utils';

interface PromissoryNoteTemplateProps {
  order: any;
  customer: Customer | null;
  paymentTable: PaymentTable | undefined;
  payments: any[];
  companyData: any;
  isCompact?: boolean;
  className?: string;
}

const PromissoryNoteTemplate: React.FC<PromissoryNoteTemplateProps> = ({
  order,
  customer,
  paymentTable,
  payments,
  companyData,
  isCompact = false,
  className = ''
}) => {
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

  const containerClass = isCompact 
    ? `promissory-note-compact ${className}` 
    : `p-6 max-w-2xl mx-auto bg-white ${className}`;

  return (
    <div className={containerClass}>
      {/* Company Header */}
      {companyData?.name && companyData.name !== 'Carregando...' && (
        <div className={`text-center ${isCompact ? 'mb-3' : 'mb-6'}`}>
          <h2 className={`font-bold ${isCompact ? 'text-sm' : 'text-lg'}`}>
            {companyData.name}
          </h2>
          {companyData.document && (
            <p className={`text-gray-600 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              CNPJ: {companyData.document}
            </p>
          )}
          {companyData.address && (
            <p className={`text-gray-600 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {companyData.address}
            </p>
          )}
        </div>
      )}

      {/* Title */}
      <div className={`text-center ${isCompact ? 'mb-3' : 'mb-6'}`}>
        <h1 className={`font-bold uppercase border-b border-t border-gray-800 py-2 ${isCompact ? 'text-lg' : 'text-2xl'}`}>
          NOTA PROMISSÓRIA
        </h1>
        <p className={`mt-2 text-right ${isCompact ? 'text-sm' : 'text-base'}`}>
          <span className="font-semibold">Valor:</span> {formatCurrency(remainingAmount || payment.amount || 0)}
        </p>
      </div>

      {/* Main Content */}
      <div className={`text-justify leading-relaxed ${isCompact ? 'mb-3 text-sm leading-tight' : 'mb-6'}`}>
        <p className={isCompact ? 'mb-2' : 'mb-4'}>
          Aos <span className="font-semibold">{formatDateToBR(payment.dueDate || new Date())}</span>,
          pagarei por esta única via de NOTA PROMISSÓRIA a {companyData?.name || "___________________"},
          ou à sua ordem, a quantia de {formatCurrency(remainingAmount || payment.amount || 0)} ({payment.amountInWords || formatCurrencyInWords(remainingAmount || payment.amount)}),
          em moeda corrente deste país.
        </p>
        <p className={isCompact ? 'text-sm' : 'text-base'}>
          Pagável em {paymentTable?.paymentLocation || payment.paymentLocation || "___________________"}
        </p>
      </div>

      {/* Customer Info */}
      <div className={`${isCompact ? 'mb-3 text-xs' : 'mb-6 text-sm'}`}>
        <p><span className="font-semibold">Nome:</span> {customer?.name || payment.customerName || "___________________"}</p>
        {(customer?.document || payment.customerDocument) && (
          <p><span className="font-semibold">CPF/CNPJ:</span> {customer?.document || payment.customerDocument}</p>
        )}
        {(customer?.address || payment.customerAddress) && (
          <p><span className="font-semibold">Endereço:</span> {customer?.address || payment.customerAddress}</p>
        )}
      </div>

      {/* Payment Details */}
      <div className={`${isCompact ? 'mb-3 text-xs' : 'mb-6 text-sm'}`}>
        <p><span className="font-semibold">Referente ao pedido:</span> #{order.code || order.id}</p>
        <p><span className="font-semibold">Data do pedido:</span> {formatDateToBR(order.date)}</p>
        {paymentTable && (
          <p><span className="font-semibold">Forma de pagamento:</span> {paymentTable.name}</p>
        )}
        {order.notes && (
          <p><span className="font-semibold">Observações:</span> {order.notes}</p>
        )}
      </div>

      {/* Signatures */}
      <div className={isCompact ? 'mt-6' : 'mt-8'}>
        <p className={`text-right mb-1 ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {paymentTable?.paymentLocation || payment.emissionLocation || "___________________"}, {formatDateToBR(payment.date || order.date || new Date())}
        </p>
        <div className={`border-t border-gray-400 pt-2 text-center ${isCompact ? 'mt-8' : 'mt-12'}`}>
          <p className={isCompact ? 'text-xs' : 'text-sm'}>Assinatura do Devedor</p>
        </div>
      </div>

      {/* Footer */}
      <div className={`text-center text-gray-500 ${isCompact ? 'mt-6 text-xs' : 'mt-8 text-sm'}`}>
        {companyData?.footer && (
          <p>{companyData.footer}</p>
        )}
      </div>
    </div>
  );
};

export default PromissoryNoteTemplate;
