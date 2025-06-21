
import { Order, MobileOrderGroup } from '@/types';
import { formatCurrency } from '@/lib/format-utils';

export interface ImportReportData {
  id: string;
  timestamp: Date;
  operationType: 'import' | 'reject';
  operator: string;
  summary: {
    totalOrders: number;
    totalVisits: number;
    totalValue: number;
    salesRepsCount: number;
    totalItems: number;
  };
  salesRepBreakdown: Array<{
    salesRepId: string;
    salesRepName: string;
    ordersCount: number;
    visitsCount: number;
    totalValue: number;
    orders: Array<{
      id: string;
      code?: number;
      customerName: string;
      total: number;
      itemsCount: number;
      rejectionReason?: string;
      status: string;
      isVisit: boolean;
    }>;
  }>;
  topProducts: Array<{
    productName: string;
    productCode: number;
    totalQuantity: number;
    occurrences: number;
  }>;
  notes?: string;
}

class MobileImportReportService {
  generateImportReport(
    orders: Order[],
    operationType: 'import' | 'reject',
    operator: string = 'admin'
  ): ImportReportData {
    console.log(`📊 Generating ${operationType} report for ${orders.length} orders`);

    // Separate orders and visits
    const regularOrders = orders.filter(order => 
      order.total > 0 && 
      order.status !== 'cancelled' && 
      order.status !== 'canceled'
    );
    
    const visits = orders.filter(order => 
      order.total === 0 || 
      order.status === 'cancelled' || 
      order.status === 'canceled'
    );

    // Calculate summary
    const totalValue = regularOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const salesRepsSet = new Set(orders.map(order => order.salesRepId));
    const totalItems = regularOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

    // Group by sales rep
    const salesRepGroups = new Map<string, {
      salesRepId: string;
      salesRepName: string;
      orders: Order[];
      regularOrders: Order[];
      visits: Order[];
      totalValue: number;
    }>();

    orders.forEach(order => {
      const key = order.salesRepId;
      if (!salesRepGroups.has(key)) {
        salesRepGroups.set(key, {
          salesRepId: order.salesRepId,
          salesRepName: order.salesRepName,
          orders: [],
          regularOrders: [],
          visits: [],
          totalValue: 0
        });
      }
      
      const group = salesRepGroups.get(key)!;
      group.orders.push(order);
      
      const isVisit = order.total === 0 || order.status === 'cancelled' || order.status === 'canceled';
      
      if (isVisit) {
        group.visits.push(order);
      } else {
        group.regularOrders.push(order);
        group.totalValue += order.total || 0;
      }
    });

    // Calculate top products (only from regular orders, not visits)
    const productMap = new Map<string, {
      productName: string;
      productCode: number;
      totalQuantity: number;
      occurrences: number;
    }>();

    regularOrders.forEach(order => {
      order.items?.forEach(item => {
        const key = `${item.productCode}-${item.productName}`;
        if (!productMap.has(key)) {
          productMap.set(key, {
            productName: item.productName,
            productCode: item.productCode,
            totalQuantity: 0,
            occurrences: 0
          });
        }
        const product = productMap.get(key)!;
        product.totalQuantity += item.quantity;
        product.occurrences += 1;
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    // Build sales rep breakdown
    const salesRepBreakdown = Array.from(salesRepGroups.values()).map(group => ({
      salesRepId: group.salesRepId,
      salesRepName: group.salesRepName,
      ordersCount: group.regularOrders.length,
      visitsCount: group.visits.length,
      totalValue: group.totalValue,
      orders: group.orders.map(order => ({
        id: order.id,
        code: order.code,
        customerName: order.customerName,
        total: order.total || 0,
        itemsCount: order.items?.length || 0,
        rejectionReason: order.rejectionReason,
        status: order.status,
        isVisit: order.total === 0 || order.status === 'cancelled' || order.status === 'canceled'
      }))
    })).sort((a, b) => b.totalValue - a.totalValue);

    const report: ImportReportData = {
      id: `${operationType}-${Date.now()}`,
      timestamp: new Date(),
      operationType,
      operator,
      summary: {
        totalOrders: regularOrders.length,
        totalVisits: visits.length,
        totalValue,
        salesRepsCount: salesRepsSet.size,
        totalItems
      },
      salesRepBreakdown,
      topProducts,
      notes: operationType === 'reject' ? 'Pedidos rejeitados durante o processo de importação' : undefined
    };

    console.log('✅ Import report generated successfully');
    console.log(`📊 Report summary: ${regularOrders.length} orders, ${visits.length} visits, ${formatCurrency(totalValue)}`);
    return report;
  }

  formatReportForDisplay(report: ImportReportData): string {
    const sections = [
      `RELATÓRIO DE ${report.operationType.toUpperCase()} DE PEDIDOS MOBILE`,
      `Gerado em: ${report.timestamp.toLocaleString('pt-BR')}`,
      `Operador: ${report.operator}`,
      '',
      '=== RESUMO EXECUTIVO ===',
      `Pedidos Importados: ${report.summary.totalOrders}`,
      `Visitas Registradas: ${report.summary.totalVisits}`,
      `Valor Total: ${formatCurrency(report.summary.totalValue)}`,
      `Vendedores Envolvidos: ${report.summary.salesRepsCount}`,
      `Total de Itens: ${report.summary.totalItems}`,
      '',
      '=== DETALHAMENTO POR VENDEDOR ===',
      ...report.salesRepBreakdown.map(rep => [
        `${rep.salesRepName} (${rep.ordersCount} pedidos, ${rep.visitsCount} visitas - ${formatCurrency(rep.totalValue)})`,
        ...rep.orders.map(order => {
          const type = order.isVisit ? 'VISITA' : 'PEDIDO';
          const reason = order.rejectionReason ? ` [Motivo: ${order.rejectionReason}]` : '';
          return `  • ${type} #${order.code || 'S/N'} - ${order.customerName} - ${formatCurrency(order.total)} (${order.itemsCount} itens)${reason}`;
        }),
        ''
      ]).flat(),
      '=== PRODUTOS MAIS VENDIDOS ===',
      ...report.topProducts.map((product, index) => 
        `${index + 1}. ${product.productName} (Cód: ${product.productCode}) - Qtd: ${product.totalQuantity} (${product.occurrences} pedidos)`
      )
    ];

    if (report.notes) {
      sections.push('', '=== OBSERVAÇÕES ===', report.notes);
    }

    return sections.join('\n');
  }
}

export const mobileImportReportService = new MobileImportReportService();
