
import { useState, useEffect } from 'react';
import { ReportFilters, ReportsData, SummaryData, TopProduct } from '@/types/reports';
import { useOrders } from '@/hooks/useOrders';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useCustomers } from '@/hooks/useCustomers';

export const useSalesReports = (filters: ReportFilters) => {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { orders } = useOrders();
  const { salesReps } = useSalesReps();
  const { customers } = useCustomers();

  const processReportsData = () => {
    console.log('🔄 [useSalesReports] Processing reports data with filters:', filters);
    
    if (!orders || orders.length === 0) {
      console.log('❌ [useSalesReports] No orders available');
      setReportsData(null);
      setSummaryData(null);
      setIsLoading(false);
      return;
    }

    // Aplicar filtros
    let filteredOrders = [...orders];

    // Filtro por vendedor
    if (filters.salesRepId) {
      filteredOrders = filteredOrders.filter(order => order.salesRepId === filters.salesRepId);
    }

    // Filtro por cliente
    if (filters.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customerId === filters.customerId);
    }

    // Filtro por status
    if (filters.orderStatus && filters.orderStatus !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === filters.orderStatus);
    }

    // Filtro por valor
    if (filters.minValue !== null && filters.minValue !== undefined) {
      filteredOrders = filteredOrders.filter(order => order.total >= filters.minValue!);
    }
    if (filters.maxValue !== null && filters.maxValue !== undefined) {
      filteredOrders = filteredOrders.filter(order => order.total <= filters.maxValue!);
    }

    // Filtro por período
    if (filters.periodPreset && filters.periodPreset !== 'custom') {
      const now = new Date();
      let startDate: Date;

      switch (filters.periodPreset) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filteredOrders = filteredOrders.filter(order => 
        new Date(order.date) >= startDate
      );
    } else if (filters.dateRange) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= filters.dateRange!.from && orderDate <= filters.dateRange!.to;
      });
    }

    console.log(`📊 [useSalesReports] Filtered ${filteredOrders.length} orders from ${orders.length} total`);

    // Calcular performance por vendedor
    const salesRepPerformance = salesReps?.map(rep => {
      const repOrders = filteredOrders.filter(order => order.salesRepId === rep.id);
      const totalRevenue = repOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = repOrders.length;
      const activeCustomers = new Set(repOrders.map(order => order.customerId)).size;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalProducts = repOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
      
      return {
        id: rep.id,
        name: rep.name,
        totalRevenue,
        totalOrders,
        activeCustomers,
        averageTicket,
        conversionRate: 85 + Math.random() * 15, // Mock data
        totalProducts,
        averageOrderValue: totalProducts / Math.max(totalOrders, 1),
        growthRate: (Math.random() - 0.5) * 40 // Mock data
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue) || [];

    // Calcular top produtos
    const productStats: Record<string, TopProduct & { ordersCount: Set<string> }> = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const key = `${item.productCode}_${item.productName}`;
        if (!productStats[key]) {
          productStats[key] = {
            id: key,
            name: item.productName,
            code: item.productCode,
            totalQuantity: 0,
            totalRevenue: 0,
            ordersCount: new Set()
          };
        }
        productStats[key].totalQuantity += item.quantity;
        productStats[key].totalRevenue += item.total;
        productStats[key].ordersCount.add(order.id);
      });
    });

    const topProducts: TopProduct[] = Object.values(productStats)
      .map(product => ({
        id: product.id,
        name: product.name,
        code: product.code,
        totalQuantity: product.totalQuantity,
        totalRevenue: product.totalRevenue,
        ordersCount: product.ordersCount.size
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calcular dados de resumo
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const activeCustomers = new Set(filteredOrders.map(order => order.customerId)).size;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const summary = {
      totalRevenue,
      totalOrders,
      activeCustomers,
      averageTicket,
      revenueChange: Math.random() * 20 - 10, // Mock data
      ordersChange: Math.random() * 30 - 15, // Mock data
      customersChange: Math.random() * 25 - 12.5, // Mock data
      ticketChange: Math.random() * 15 - 7.5 // Mock data
    };

    const processedData: ReportsData = {
      orders: filteredOrders,
      salesRepPerformance,
      topProducts,
      summary
    };

    console.log('✅ [useSalesReports] Reports data processed successfully:', {
      ordersCount: filteredOrders.length,
      salesRepsCount: salesRepPerformance.length,
      topProductsCount: topProducts.length
    });

    setReportsData(processedData);
    setSummaryData(summary);
    setIsLoading(false);
  };

  const refreshReports = () => {
    console.log('🔄 [useSalesReports] Refreshing reports data');
    setIsLoading(true);
    processReportsData();
  };

  useEffect(() => {
    processReportsData();
  }, [orders, salesReps, customers, filters]);

  return {
    reportsData,
    summaryData,
    isLoading,
    refreshReports
  };
};
