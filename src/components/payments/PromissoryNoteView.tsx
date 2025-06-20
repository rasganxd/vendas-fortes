
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

  // Simplify company data check - just check if we have basic data
  const isCompanyDataLoaded = companyData && companyData.name;

  // Handle print functionality with simplified validation
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nota_Promissoria_${order.code || order.id}`,
    onBeforePrint: () => {
      console.log("🖨️ Preparando para imprimir nota promissória individual...", {
        orderId: order.id,
        orderCode: order.code,
        companyName: companyData?.name
      });
    },
    onAfterPrint: () => {
      console.log("✅ Impressão individual concluída");
    },
    onPrintError: (error) => {
      console.error("❌ Erro na impressão individual:", error);
    }
  });

  // Handle print with simplified validation
  const handlePrintClick = async () => {
    console.log("🖨️ Iniciando impressão individual...", {
      hasCompanyData: !!companyData,
      companyName: companyData?.name,
      hasPrintRef: !!printRef.current
    });

    if (!printRef.current) {
      console.error("❌ Referência de impressão não disponível");
      return;
    }

    // Check if running in Electron for native printing
    if (window.electronAPI && window.electronAPI.printContent) {
      try {
        console.log("🖨️ Usando impressão nativa do Electron...");
        const printContent = printRef.current.outerHTML;
        const printStyles = `
          <style>
            @page { margin: 0.5cm; size: A4 portrait; }
            body { 
              font-family: Arial, sans-serif; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .promissory-note-compact { 
              border: 2px solid #000; 
              padding: 0.5cm; 
              font-size: 9pt;
              line-height: 1.2;
            }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-justify { text-align: justify; }
            .uppercase { text-transform: uppercase; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .border-gray-800 { border-color: #000; }
            .border-gray-400 { border-color: #666; }
            .text-gray-500 { color: #777; }
          </style>
        `;
        
        const fullHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Nota Promissória - ${order.code}</title>
              <meta charset="utf-8">
              ${printStyles}
            </head>
            <body>${printContent}</body>
          </html>
        `;

        await window.electronAPI.printContent(fullHTML, {
          printBackground: true,
          color: true,
          margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
        });
      } catch (error) {
        console.error("❌ Erro na impressão Electron, usando fallback:", error);
        handlePrint();
      }
    } else {
      console.log("🖨️ Usando impressão web padrão...");
      handlePrint();
    }
  };

  return (
    <div className="relative">
      {/* Print Button */}
      <div className="absolute top-1 right-1 print:hidden z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrintClick}
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
