import { useState, useEffect, useMemo } from 'react';
import { Order, OrderItem, SalesRep, Customer } from '@/types';
import { ReportFilters, SalesReportData, SalesMetrics, TopProduct, SalesRepPerformance, ChartData } from '@/types/reports';
import { useOrders } from '@/hooks/useOrders';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useCustomers } from '@/hooks/useCustomers';

export const useSalesReports = () => {
  const { orders, isLoading: ordersLoading } = useOrders();
  const { salesReps, isLoading: salesRepsLoading } = useSalesReps();
  const { customers, isLoading: customersLoading } = useCustomers();
  
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'month'
  });

  const isLoading = ordersLoading || salesRepsLoading || customersLoading;

  // Função para calcular datas do período
  const getPeriodDates = (period: ReportFilters['period']) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'week':
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        break;
      case 'last_week':
        const lastWeekStart = now.getDate() - now.getDay() - 7;
        const lastWeekEnd = now.getDate() - now.getDay() - 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), lastWeekStart);
        endDate = new Date(now.getFullYear(), now.getMonth(), lastWeekEnd, 23, 59, 59);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  // Aplicar filtros nos pedidos
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Filtro por vendedor
    if (filters.salesRepId) {
      filtered = filtered.filter(order => order.salesRepId === filters.salesRepId);
    }

    // Filtro por cliente
    if (filters.customerId) {
      filtered = filtered.filter(order => order.customerId === filters.customerId);
    }

    // Filtro por status
    if (filters.orderStatus) {
      filtered = filtered.filter(order => order.status === filters.orderStatus);
    }

    // Filtro por valor
    if (filters.minValue !== undefined) {
      filtered = filtered.filter(order => order.total >= filters.minValue!);
    }
    if (filters.maxValue !== undefined) {
      filtered = filtered.filter(order => order.total <= filters.maxValue!);
    }

    // Filtro por período
    if (filters.period || filters.startDate || filters.endDate) {
      let startDate: Date;
      let endDate: Date;

      if (filters.period && filters.period !== 'custom') {
        const dates = getPeriodDates(filters.period);
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        startDate = filters.startDate || new Date(0);
        endDate = filters.endDate || new Date();
      }

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return filtered;
  }, [orders, filters]);

  // Converter pedidos para dados do relatório
  const salesReportData: SalesReportData[] = useMemo(() => {
    return filteredOrders.map(order => ({
      orderId: order.id,
      orderCode: order.code,
      customerName: order.customerName,
      salesRepName: order.salesRepName,
      date: order.date,
      total: order.total,
      status: order.status,
      itemsCount: order.items?.length || 0,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    }));
  }, [filteredOrders]);

  // Calcular métricas
  const metrics: SalesMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Contar produtos únicos
    const uniqueProducts = new Set<string>();
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        uniqueProducts.add(item.productId || item.productName);
      });
    });

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts: uniqueProducts.size
    };
  }, [filteredOrders]);

  // Top produtos
  const topProducts: TopProduct[] = useMemo(() => {
    const productData = new Map<string, {
      id: string;
      name: string;
      code: number;
      totalQuantity: number;
      totalRevenue: number;
      ordersCount: number;
    }>();

    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.productId || item.productName;
        const existing = productData.get(key) || {
          id: item.productId || key,
          name: item.productName,
          code: item.productCode ? Number(item.productCode) : 0,
          totalQuantity: 0,
          totalRevenue: 0,
          ordersCount: 0
        };

        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.total;
        existing.ordersCount += 1;
        productData.set(key, existing);
      });
    });

    return Array.from(productData.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [filteredOrders]);

  // Performance por vendedor
  const salesRepPerformance: SalesRepPerformance[] = useMemo(() => {
    const performanceData = new Map<string, SalesRepPerformance>();

    filteredOrders.forEach(order => {
      const key = order.salesRepId;
      if (!key) return;

      const existing = performanceData.get(key) || {
        salesRepId: order.salesRepId,
        salesRepName: order.salesRepName,
        totalRevenue: 0,
        ordersCount: 0,
        productsCount: 0,
        averageOrderValue: 0,
        topProducts: []
      };

      existing.totalRevenue += order.total;
      existing.ordersCount += 1;
      performanceData.set(key, existing);
    });

    // Calcular valores médios e produtos por vendedor
    performanceData.forEach((performance, salesRepId) => {
      performance.averageOrderValue = performance.ordersCount > 0 
        ? performance.totalRevenue / performance.ordersCount 
        : 0;

      // Produtos únicos por vendedor
      const uniqueProducts = new Set<string>();

      filteredOrders
        .filter(order => order.salesRepId === salesRepId)
        .forEach(order => {
          order.items?.forEach(item => {
            const productKey = item.productId || item.productName;
            uniqueProducts.add(productKey);
          });
        });

      performance.productsCount = uniqueProducts.size;
    });

    return Array.from(performanceData.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredOrders]);

  // Dados para gráficos
  const chartData: ChartData[] = useMemo(() => {
    const dailyRevenue = new Map<string, number>();

    filteredOrders.forEach(order => {
      const dateKey = new Date(order.date).toISOString().split('T')[0];
      const current = dailyRevenue.get(dateKey) || 0;
      dailyRevenue.set(dateKey, current + order.total);
    });

    return Array.from(dailyRevenue.entries())
      .map(([date, value]) => ({ name: date, value, date }))
      .sort((a, b) => a.date!.localeCompare(b.date!));
  }, [filteredOrders]);

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ period: 'month' });
  };

  return {
    // Data
    salesReportData,
    filteredOrders,
    metrics,
    topProducts,
    salesRepPerformance,
    chartData,
    
    // Filters
    filters,
    updateFilters,
    clearFilters,
    
    // Loading
    isLoading,
    
    // Reference data
    salesReps: salesReps || [],
    customers: customers || []
  };
};
