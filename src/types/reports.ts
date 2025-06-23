export interface ReportFilters {
  salesRepId?: string;
  salesRepName?: string;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  customerName?: string;
  minValue?: number;
  maxValue?: number;
  orderStatus?: string;
  period?: 'today' | 'yesterday' | 'week' | 'last_week' | 'month' | 'last_month' | 'quarter' | 'year' | 'custom';
}

export interface SalesReportData {
  orderId: string;
  orderCode: number;
  customerName: string;
  salesRepName: string;
  date: Date;
  total: number;
  status: string;
  itemsCount: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
}

export interface TopProduct {
  id: string;
  name: string;
  code: number;
  totalQuantity: number;
  totalRevenue: number;
  ordersCount: number;
}

export interface SalesRepPerformance {
  salesRepId: string;
  salesRepName: string;
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
}

export interface ReportType {
  id: 'complete' | 'basic' | 'sales-only' | 'products-by-salesrep';
  name: string;
  description: string;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}
