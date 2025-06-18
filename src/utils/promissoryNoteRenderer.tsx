
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PromissoryNoteTemplate from '@/components/payments/PromissoryNoteTemplate';
import { Customer, PaymentTable } from '@/types';

interface RenderPromissoryNoteOptions {
  order: any;
  customer: Customer | null;
  paymentTable: PaymentTable | undefined;
  payments: any[];
  companyData: any;
}

export const renderPromissoryNoteToHTML = (options: RenderPromissoryNoteOptions): string => {
  const { order, customer, paymentTable, payments, companyData } = options;
  
  try {
    const reactElement = React.createElement(PromissoryNoteTemplate, {
      order,
      customer,
      paymentTable,
      payments,
      companyData,
      isCompact: true,
      className: 'promissory-note-print'
    });

    return ReactDOMServer.renderToStaticMarkup(reactElement);
  } catch (error) {
    console.error('❌ Erro ao renderizar nota promissória:', error);
    return `<div class="error">Erro ao gerar nota promissória para pedido ${order.code}</div>`;
  }
};

export const generateMultiplePromissoryNotesHTML = (
  orders: any[],
  customers: Customer[],
  paymentTables: PaymentTable[],
  payments: any[],
  companyData: any
): string => {
  const promissoryNotesHTML = orders.map(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
    const orderPayments = payments.filter(p => p.orderId === order.id);

    return renderPromissoryNoteToHTML({
      order,
      customer,
      paymentTable,
      payments: orderPayments,
      companyData
    });
  }).join('');

  // Print styles consistent with the CSS file
  const printStyles = `
    <style>
      @page {
        margin: 0.5cm;
        size: A4 portrait;
      }
      
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-size: 10pt;
        line-height: 1.2;
      }
      
      .promissory-note-compact {
        page-break-inside: avoid;
        height: calc(33.33vh - 1cm);
        max-height: 25cm;
        border: 2px solid #000;
        margin-bottom: 0.5cm;
        padding: 0.5cm;
        font-size: 9pt;
        line-height: 1.2;
        background: white;
        width: 100%;
        box-sizing: border-box;
      }
      
      .promissory-note-compact:nth-child(3n) {
        page-break-after: always;
      }
      
      .promissory-note-compact:last-child {
        page-break-after: avoid;
      }
      
      .promissory-note-compact h1 {
        font-size: 14pt;
        font-weight: 700;
        margin: 0.2cm 0;
        padding: 0.1cm;
      }
      
      .promissory-note-compact h2 {
        font-size: 11pt;
        font-weight: 600;
        margin: 0.1cm 0;
      }
      
      .promissory-note-compact p {
        margin: 0.1cm 0;
        font-size: 9pt;
      }
      
      .text-xs { font-size: 8pt; }
      .text-sm { font-size: 9pt; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .uppercase { text-transform: uppercase; }
      .border-b { border-bottom: 1px solid #000; }
      .border-t { border-top: 1px solid #000; }
      .border-gray-800 { border-color: #000; }
      .border-gray-400 { border-color: #666; }
      .text-gray-600 { color: #666; }
      .text-gray-500 { color: #777; }
      .py-2 { padding-top: 0.1cm; padding-bottom: 0.1cm; }
      .pt-2 { padding-top: 0.1cm; }
      .mb-3 { margin-bottom: 0.2cm; }
      .mb-6 { margin-bottom: 0.3cm; }
      .mt-6 { margin-top: 0.3cm; }
      .mt-8 { margin-top: 0.5cm; }
      .leading-relaxed { line-height: 1.3; }
      .leading-tight { line-height: 1.2; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Impressão de Notas Promissórias</title>
        <meta charset="utf-8">
        ${printStyles}
      </head>
      <body>
        ${promissoryNotesHTML}
      </body>
    </html>
  `;
};
