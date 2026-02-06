
import React from 'react';
import { Customer, Payment, PaymentTable } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PromissoryNoteTemplate from './PromissoryNoteTemplate';
import { generateMultiplePromissoryNotesHTML } from '@/utils/promissoryNoteRenderer';
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

  // Handle print using the same approach as bulk printing (new window with full HTML)
  const handlePrintClick = async () => {
    console.log("🖨️ Iniciando impressão individual...", {
      orderId: order.id,
      orderCode: order.code,
      companyName: companyData?.name
    });

    const customers = customer ? [customer] : [];
    const paymentTables = paymentTable ? [paymentTable] : [];

    // Check if running in Electron for native printing
    if (window.electronAPI && window.electronAPI.printContent) {
      try {
        console.log("🖨️ Usando impressão nativa do Electron...");
        const htmlContent = generateMultiplePromissoryNotesHTML(
          [order], customers, paymentTables, payments, companyData
        );
        const result = await window.electronAPI.printContent(htmlContent, {
          printBackground: true,
          color: true,
          margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
        });
        if (!result.success) {
          console.error('❌ Erro na impressão Electron:', result.error);
          handleWebPrint(customers, paymentTables);
        }
      } catch (error) {
        console.error("❌ Erro na impressão Electron, usando fallback:", error);
        handleWebPrint(customers, paymentTables);
      }
    } else {
      console.log("🖨️ Usando impressão web padrão...");
      handleWebPrint(customers, paymentTables);
    }
  };

  const handleWebPrint = (customersList: any[], paymentTablesList: any[]) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error("❌ Não foi possível abrir janela de impressão");
      return;
    }
    const htmlContent = generateMultiplePromissoryNotesHTML(
      [order], customersList, paymentTablesList, payments, companyData
    );
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          console.log('✅ Impressão individual concluída');
        }, 2000);
      }, 500);
    };
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
      <div>
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
