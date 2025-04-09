
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { PaymentTable } from '@/types';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { formatDateToBR, addDays } from '@/lib/date-utils';

interface PromissoryNoteViewProps {
  customerId: string;
  customerName: string;
  paymentTable: PaymentTable;
  total: number;
}

export default function PromissoryNoteView({
  customerId,
  customerName,
  paymentTable,
  total
}: PromissoryNoteViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `NotaPromissoria-${customerName}`,
    removeAfterPrint: true,
  });
  
  // Define styles for printing
  const printStyles = `
    @media print {
      @page {
        size: A4;
        margin: 0.5cm;
      }
      .print-promissory-note {
        page-break-inside: avoid;
      }
      .no-print {
        display: none;
      }
    }
  `;
  
  // Calculate installment amounts
  const installments = paymentTable.terms.map(term => {
    const amount = (term.percentage / 100) * total;
    const dueDate = addDays(new Date(), term.days);
    return {
      ...term,
      amount,
      dueDate
    };
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Convert number to words for the promissory note
  const numberToWords = (num: number) => {
    // This is a simplified implementation
    // For a real-world application, you would use a dedicated library
    const units = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    
    if (num === 0) return 'zero';
    
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const unit = num % 10;
      const ten = Math.floor(num / 10);
      return tens[ten] + (unit ? ' e ' + units[unit] : '');
    }
    
    if (num === 100) return 'cem';
    if (num < 1000) {
      const remainder = num % 100;
      const hundred = Math.floor(num / 100);
      return hundreds[hundred] + (remainder ? ' e ' + numberToWords(remainder) : '');
    }
    
    // This is a simplified version - in reality you would handle thousands, millions, etc.
    return num.toString();
  };

  return (
    <div>
      <style>{printStyles}</style>
      
      <div className="mb-4 flex justify-end no-print">
        <Button onClick={() => handlePrint()} className="flex items-center gap-2">
          <Printer size={16} /> Imprimir Nota Promissória
        </Button>
      </div>
      
      <div ref={printRef} className="p-4 border rounded-lg">
        {installments.map((installment, index) => (
          <div key={installment.id} className="print-promissory-note mb-8 last:mb-0">
            <div className="text-center font-bold text-xl border-b-2 border-black pb-2 mb-4">
              NOTA PROMISSÓRIA
            </div>
            
            <div className="flex justify-between mb-6">
              <div>
                <span className="font-bold">Valor:</span> {formatCurrency(installment.amount)}
              </div>
              <div>
                <span className="font-bold">Vencimento:</span> {formatDateToBR(installment.dueDate)}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-justify">
                Ao {formatDateToBR(installment.dueDate)}, pagarei por esta única via de NOTA PROMISSÓRIA a {
                  paymentTable.payableTo || "ordem"
                } ou à sua ordem, a quantia de {formatCurrency(installment.amount)} ({
                  numberToWords(Math.floor(installment.amount))
                } reais e {
                  numberToWords(Math.round((installment.amount % 1) * 100))
                } centavos), pagável em {paymentTable.paymentLocation || "local acordado"}.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="font-semibold">Emitente:</div>
              <div>{customerName}</div>
              <div>ID: {customerId}</div>
            </div>
            
            <div className="mt-12 border-t pt-4">
              <div className="text-center">_______________________________________________________</div>
              <div className="text-center">Assinatura do Emitente</div>
            </div>
            
            {index < installments.length - 1 && (
              <div className="page-break-after my-10 border-b border-dashed"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
