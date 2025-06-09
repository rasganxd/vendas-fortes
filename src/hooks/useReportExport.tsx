
import { useCallback } from 'react';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency, formatDate } from '@/lib/format-utils';

export const useReportExport = () => {
  const exportToPDF = useCallback(async (reportType: string, data: ReportsData, filters: ReportFilters) => {
    console.log('📄 [useReportExport] Exporting to PDF:', reportType);
    
    // Mock implementation - would use a PDF library like jsPDF
    const content = generateReportContent(reportType, data, filters);
    
    // Create a blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportToExcel = useCallback(async (reportType: string, data: ReportsData, filters: ReportFilters) => {
    console.log('📊 [useReportExport] Exporting to Excel:', reportType);
    
    // Mock implementation - would use a library like xlsx
    const csvContent = generateCSVContent(data);
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportToCSV = useCallback(async (reportType: string, data: ReportsData, filters: ReportFilters) => {
    console.log('📋 [useReportExport] Exporting to CSV:', reportType);
    
    const csvContent = generateCSVContent(data);
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportChartAsImage = useCallback(async (reportType: string, data: ReportsData) => {
    console.log('🖼️ [useReportExport] Exporting chart as image:', reportType);
    
    // Mock implementation - would capture chart canvas
    // For now, just show a message
    alert('Funcionalidade de exportar gráficos será implementada em breve!');
  }, []);

  const generateReportContent = (reportType: string, data: ReportsData, filters: ReportFilters): string => {
    let content = `RELATÓRIO DE VENDAS - ${reportType.toUpperCase()}\n`;
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    if (data.summary) {
      content += `RESUMO:\n`;
      content += `Receita Total: ${formatCurrency(data.summary.totalRevenue)}\n`;
      content += `Total de Pedidos: ${data.summary.totalOrders}\n`;
      content += `Clientes Ativos: ${data.summary.activeCustomers}\n`;
      content += `Ticket Médio: ${formatCurrency(data.summary.averageTicket)}\n\n`;
    }
    
    if (data.orders) {
      content += `PEDIDOS:\n`;
      data.orders.slice(0, 20).forEach(order => {
        content += `#${order.code} - ${order.customerName} - ${formatCurrency(order.total)} - ${formatDate(order.date)}\n`;
      });
    }
    
    return content;
  };

  const generateCSVContent = (data: ReportsData): string => {
    if (!data.orders) return '';
    
    const headers = [
      'Código',
      'Data',
      'Cliente',
      'Vendedor',
      'Status',
      'Valor',
      'Forma Pagamento'
    ];
    
    let csv = headers.join(',') + '\n';
    
    data.orders.forEach(order => {
      const row = [
        order.code,
        formatDate(order.date),
        `"${order.customerName}"`,
        `"${order.salesRepName}"`,
        order.status,
        order.total,
        `"${order.paymentMethod || ''}"`
      ];
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  return {
    exportToPDF,
    exportToExcel,
    exportToCSV,
    exportChartAsImage
  };
};
