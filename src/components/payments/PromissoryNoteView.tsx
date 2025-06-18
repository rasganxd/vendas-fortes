
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
  const isCompanyDataLoaded = companyData && 
    companyData.name && 
    companyData.name !== 'Carregando...' && 
    companyData.name.trim() !== '';

  // Handle print functionality with better error handling and data validation
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nota_Promissoria_${order.code || order.id}`,
    onBeforePrint: () => {
      console.log("🖨️ Preparando para imprimir nota promissória...", {
        orderId: order.id,
        orderCode: order.code,
        companyDataLoaded: isCompanyDataLoaded,
        companyName: companyData?.name
      });
      
      if (!isCompanyDataLoaded) {
        console.warn("⚠️ Company data not fully loaded yet");
        return false;
      }
      
      if (!printRef.current) {
        console.error("❌ Print reference not available");
        return false;
      }
      
      return true;
    },
    onAfterPrint: () => {
      console.log("✅ Impressão individual concluída");
    },
    onPrintError: (error) => {
      console.error("❌ Erro na impressão individual:", error);
    },
    // Add print options for better compatibility
    pageStyle: `
      @page {
        margin: 0.5cm;
        size: A4 portrait;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-family: Arial, sans-serif;
        }
      }
    `
  });

  // Handle print with validation and fallback
  const handlePrintClick = async () => {
    if (!isCompanyDataLoaded) {
      console.warn("⏳ Aguardando carregamento dos dados da empresa...");
      
      // Try to wait a bit for data to load
      setTimeout(() => {
        if (isCompanyDataLoaded) {
          handlePrint();
        } else {
          console.error("❌ Dados da empresa não carregaram após timeout");
        }
      }, 1000);
      return;
    }

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
            ${document.querySelector('style[data-styled]')?.textContent || ''}
            @page { margin: 0.5cm; size: A4 portrait; }
            body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; }
            .promissory-note-compact { border: 2px solid #000; padding: 0.5cm; }
          </style>
        `;
        
        const fullHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Nota Promissória - ${order.code}</title>
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
