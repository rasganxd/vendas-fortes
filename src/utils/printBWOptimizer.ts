
/**
 * Utilities for optimizing print output for black and white printers
 */

export const BW_PRINT_STYLES = `
  /* Base B&W Print Optimization */
  @media print {
    * {
      background: white !important;
      color: black !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Headers with strong borders */
    .bw-header {
      border: 3px double black !important;
      padding: 10px !important;
      text-align: center !important;
      margin-bottom: 15px !important;
    }
    
    .bw-header h1 {
      font-weight: 900 !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
    }
    
    /* Tables optimized for B&W */
    .bw-table {
      border: 2px solid black !important;
      border-collapse: collapse !important;
      width: 100% !important;
    }
    
    .bw-table th {
      border: 2px solid black !important;
      background: white !important;
      font-weight: 900 !important;
      text-transform: uppercase !important;
      padding: 8px !important;
    }
    
    .bw-table td {
      border: 1px solid black !important;
      padding: 6px !important;
      background: white !important;
    }
    
    .bw-table tbody tr:nth-child(even) {
      border-top: 2px solid black !important;
      border-bottom: 2px solid black !important;
    }
    
    /* Important sections */
    .bw-important {
      border: 3px double black !important;
      padding: 8px !important;
      margin: 10px 0 !important;
    }
    
    .bw-section {
      border: 1px solid black !important;
      margin: 8px 0 !important;
      padding: 6px !important;
    }
    
    .bw-total {
      border: 2px solid black !important;
      background: white !important;
      padding: 8px !important;
      font-weight: 900 !important;
      text-align: center !important;
    }
    
    /* Status indicators */
    .bw-status-pending::before { content: "⏳ "; }
    .bw-status-confirmed::before { content: "✓ "; }
    .bw-status-completed::before { content: "✅ "; }
    .bw-status-cancelled::before { content: "❌ "; }
    
    /* Payment method indicators */
    .bw-payment-cash::before { content: "💰 "; }
    .bw-payment-card::before { content: "💳 "; }
    .bw-payment-pending::before { content: "📋 "; }
    
    /* Text emphasis */
    .bw-emphasis {
      font-weight: 900 !important;
      text-decoration: underline !important;
    }
    
    .bw-secondary {
      border: 1px solid #666 !important;
      color: #333 !important;
    }
  }
`;

export const generateBWOptimizedHTML = (content: string, title: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          ${BW_PRINT_STYLES}
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
};

export const addBWClasses = (htmlContent: string): string => {
  return htmlContent
    .replace(/class="([^"]*table[^"]*)"/g, 'class="$1 bw-table"')
    .replace(/class="([^"]*header[^"]*)"/g, 'class="$1 bw-header"')
    .replace(/class="([^"]*total[^"]*)"/g, 'class="$1 bw-total"')
    .replace(/class="([^"]*important[^"]*)"/g, 'class="$1 bw-important"')
    .replace(/status-pending/g, 'status-pending bw-status-pending')
    .replace(/status-confirmed/g, 'status-confirmed bw-status-confirmed')
    .replace(/status-completed/g, 'status-completed bw-status-completed')
    .replace(/status-cancelled/g, 'status-cancelled bw-status-cancelled');
};

export const getStatusIcon = (status: string): string => {
  const icons = {
    pending: '⏳',
    confirmed: '✓',
    completed: '✅',
    cancelled: '❌',
    processing: '⚡'
  };
  return icons[status as keyof typeof icons] || '•';
};

export const getPaymentIcon = (method: string): string => {
  const icons = {
    dinheiro: '💰',
    cartao: '💳',
    pix: '📱',
    boleto: '📄',
    cheque: '📝',
    promissoria: '📋'
  };
  return icons[method?.toLowerCase() as keyof typeof icons] || '💳';
};
