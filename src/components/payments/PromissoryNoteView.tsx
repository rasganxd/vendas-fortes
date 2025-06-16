
import React, { useRef } from 'react';
import { Customer, Payment, PaymentTable } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PromissoryNoteTemplate from './PromissoryNoteTemplate';
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

  // Check if company data is loaded to prevent white screen
  const isCompanyDataLoaded = companyData && companyData.name && companyData.name !== 'Carregando...';

  // Handle print functionality with better error handling
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nota_Promissoria_${order.code || ''}`,
    onBeforePrint: () => {
      console.log("Preparando para imprimir...");
      if (!isCompanyDataLoaded) {
        console.warn("Company data not loaded yet");
      }
    },
    onAfterPrint: () => console.log("Impressão concluída"),
    onPrintError: (error) => {
      console.error("Erro na impressão:", error);
    }
  });

  // Prevent printing if data is not ready
  const handlePrintClick = () => {
    if (!isCompanyDataLoaded) {
      console.warn("Aguardando carregamento dos dados da empresa...");
      return;
    }
    handlePrint();
  };

  return (
    <div className="relative">
      {/* Print Button */}
      <div className="absolute top-1 right-1 print:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrintClick}
          disabled={!isCompanyDataLoaded}
          className="flex items-center gap-1 text-xs px-2 py-1"
        >
          <Printer className="h-3 w-3" />
          <span>Imprimir</span>
        </Button>
      </div>

      {/* Promissory Note Content using Template */}
      <div ref={printRef}>
        <PromissoryNoteTemplate
          order={order}
          customer={customer}
          paymentTable={paymentTable}
          payments={payments}
          companyData={companyData}
          isCompact={true}
          className={highlight ? 'highlight-note border-2 rounded-md' : ''}
        />
      </div>
    </div>
  );
};

export default PromissoryNoteView;
