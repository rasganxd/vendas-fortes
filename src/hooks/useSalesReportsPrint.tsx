
import { useState } from 'react';
import { SalesReportData, ReportFilters } from '@/types/reports';
import { toast } from 'sonner';

interface PrintOptions {
  classifyBySupervisor: boolean;
  hideCategory: boolean;
  showExchangeCommission: boolean;
  simplifiedLayout: boolean;
}

export const useSalesReportsPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  const printSalesReport = async (
    data: SalesReportData[],
    reportType: string,
    filters: ReportFilters,
    options: PrintOptions
  ) => {
    try {
      setIsPrinting(true);
      console.log('🖨️ [SalesReportsPrint] Starting print process');
      console.log('🖨️ [SalesReportsPrint] Report type:', reportType);
      console.log('🖨️ [SalesReportsPrint] Data count:', data.length);
      console.log('🖨️ [SalesReportsPrint] Filters:', filters);
      console.log('🖨️ [SalesReportsPrint] Options:', options);

      // Create printable content
      const printContent = createPrintableContent(data, reportType, filters, options);
      
      // Apply print styles
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Não foi possível abrir a janela de impressão');
      }

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      toast.success('Relatório preparado para impressão!');
      
    } catch (error) {
      console.error('❌ [SalesReportsPrint] Error:', error);
      toast.error('Erro ao preparar relatório para impressão');
    } finally {
      setIsPrinting(false);
    }
  };

  const createPrintableContent = (
    data: SalesReportData[],
    reportType: string,
    filters: ReportFilters,
    options: PrintOptions
  ): string => {
    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);

    const formatDate = (date: Date) => 
      new Intl.DateTimeFormat('pt-BR').format(new Date(date));

    const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);
    const averageOrder = data.length > 0 ? totalRevenue / data.length : 0;

    const appliedFilters = getAppliedFiltersText(filters);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Vendas</title>
          <style>
            @page { 
              margin: 1cm; 
              size: A4; 
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.4; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
            }
            .header h1 { 
              font-size: 18px; 
              margin-bottom: 5px; 
            }
            .header p { 
              font-size: 10px; 
              color: #666; 
            }
            .filters { 
              background: #f5f5f5; 
              padding: 10px; 
              margin-bottom: 15px; 
              border-radius: 4px; 
            }
            .filters h3 { 
              font-size: 12px; 
              margin-bottom: 5px; 
            }
            .filters p { 
              font-size: 10px; 
              line-height: 1.3; 
            }
            .summary { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr; 
              gap: 15px; 
              margin-bottom: 20px; 
            }
            .summary-card { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: center; 
              border-radius: 4px; 
            }
            .summary-card h4 { 
              font-size: 11px; 
              color: #666; 
              margin-bottom: 5px; 
            }
            .summary-card .value { 
              font-size: 14px; 
              font-weight: bold; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
              font-size: 10px; 
            }
            th { 
              background: #f8f9fa; 
              font-weight: bold; 
              text-align: center; 
            }
            .number { 
              text-align: right; 
            }
            .center { 
              text-align: center; 
            }
            .footer { 
              position: fixed; 
              bottom: 0; 
              left: 0; 
              right: 0; 
              text-align: center; 
              font-size: 8px; 
              color: #666; 
              padding: 10px; 
            }
            @media print {
              .no-print { display: none; }
              body { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${getReportTitle(reportType)}</h1>
            <p>Gerado em ${formatDate(new Date())} • Sistema de Vendas</p>
          </div>

          ${appliedFilters ? `
            <div class="filters">
              <h3>Filtros Aplicados:</h3>
              <p>${appliedFilters}</p>
            </div>
          ` : ''}

          <div class="summary">
            <div class="summary-card">
              <h4>Total de Vendas</h4>
              <div class="value">${data.length}</div>
            </div>
            <div class="summary-card">
              <h4>Receita Total</h4>
              <div class="value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="summary-card">
              <h4>Ticket Médio</h4>
              <div class="value">${formatCurrency(averageOrder)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Status</th>
                <th>Valor</th>
                <th>% do Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(sale => {
                const percentage = totalRevenue > 0 ? (sale.total / totalRevenue) * 100 : 0;
                return `
                  <tr>
                    <td class="center">#${sale.orderCode}</td>
                    <td class="center">${formatDate(sale.date)}</td>
                    <td>${sale.customerName}</td>
                    <td>${sale.salesRepName}</td>
                    <td class="center">${getStatusLabel(sale.status)}</td>
                    <td class="number">${formatCurrency(sale.total)}</td>
                    <td class="number">${percentage.toFixed(1)}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Página 1 de 1 • ${data.length} registros • Sistema de Vendas
          </div>
        </body>
      </html>
    `;
  };

  const getReportTitle = (reportType: string): string => {
    const titles = {
      complete: 'Relatório Completo de Vendas',
      basic: 'Relatório Executivo de Vendas',
      'sales-only': 'Relatório de Vendas',
      'products-by-salesrep': 'Produtos por Vendedor'
    };
    return titles[reportType as keyof typeof titles] || 'Relatório de Vendas';
  };

  const getAppliedFiltersText = (filters: ReportFilters): string => {
    const filterTexts: string[] = [];
    
    if (filters.period) {
      const periodLabels = {
        today: 'Hoje',
        week: 'Esta Semana',
        month: 'Este Mês',
        quarter: 'Este Trimestre',
        year: 'Este Ano',
        custom: 'Período Personalizado'
      };
      filterTexts.push(`Período: ${periodLabels[filters.period]}`);
    }
    
    if (filters.salesRepName) {
      filterTexts.push(`Vendedor: ${filters.salesRepName}`);
    }
    
    if (filters.customerName) {
      filterTexts.push(`Cliente: ${filters.customerName}`);
    }
    
    if (filters.orderStatus) {
      filterTexts.push(`Status: ${filters.orderStatus}`);
    }
    
    if (filters.minValue !== undefined) {
      filterTexts.push(`Valor Mín: R$ ${filters.minValue.toFixed(2)}`);
    }
    
    if (filters.maxValue !== undefined) {
      filterTexts.push(`Valor Máx: R$ ${filters.maxValue.toFixed(2)}`);
    }

    return filterTexts.join(' • ');
  };

  const getStatusLabel = (status: string): string => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      processing: 'Processando',
      completed: 'Concluído',
      canceled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return {
    printSalesReport,
    isPrinting
  };
};
