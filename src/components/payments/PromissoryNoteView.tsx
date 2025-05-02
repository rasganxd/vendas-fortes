
import React from 'react';
import { Payment } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/format-utils';
import { useAppContext } from '@/hooks/useAppContext';

interface PromissoryNoteViewProps {
  payment: Payment;
}

const PromissoryNoteView: React.FC<PromissoryNoteViewProps> = ({ payment }) => {
  const { settings } = useAppContext();
  const companyData = settings?.company;

  return (
    <div className="p-4 max-w-2xl mx-auto">
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
          <span className="font-semibold">Valor:</span> {formatCurrency(payment.amount)}
        </p>
      </div>

      {/* Main Content */}
      <div className="mb-6 text-justify">
        <p className="mb-4">
          Aos <span className="font-semibold">{formatDateToBR(payment.dueDate || new Date())}</span>,
          pagarei por esta única via de NOTA PROMISSÓRIA a {companyData?.name || "___________________"},
          ou à sua ordem, a quantia de {formatCurrency(payment.amount)} ({payment.amountInWords || "___________________"}),
          em moeda corrente deste país.
        </p>
        <p>
          Pagável em {payment.paymentLocation || "___________________"}
        </p>
      </div>

      {/* Signatures */}
      <div className="mt-12">
        <p className="text-right mb-2">
          {payment.emissionLocation || "___________________"}, {formatDateToBR(payment.date)}
        </p>
        <div className="border-t border-gray-400 pt-2 mt-16 text-center">
          <p>Assinatura do Emitente</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mt-8">
        <p><span className="font-semibold">Nome:</span> {payment.customerName}</p>
        {payment.customerDocument && (
          <p><span className="font-semibold">CPF/CNPJ:</span> {payment.customerDocument}</p>
        )}
        {payment.customerAddress && (
          <p><span className="font-semibold">Endereço:</span> {payment.customerAddress}</p>
        )}
      </div>

      {/* Payment Details */}
      <div className="mt-8 text-sm">
        <p><span className="font-semibold">Referente ao pedido:</span> {payment.orderId}</p>
        {payment.notes && (
          <p><span className="font-semibold">Observações:</span> {payment.notes}</p>
        )}
        {payment.installments && Array.isArray(payment.installments) && payment.installments.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Parcelas:</p>
            <ul className="list-disc pl-5">
              {payment.installments.map((installment, index) => (
                <li key={index}>
                  {formatDateToBR(installment.dueDate)}: {formatCurrency(installment.amount)}
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
  );
};

export default PromissoryNoteView;
