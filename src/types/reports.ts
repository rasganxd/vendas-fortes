
export interface ReportFilters {
  salesRepId?: string | null;
  customerId?: string | null;
  periodPreset?: string | null;
  dateRange?: {
    from: Date;
    to: Date;
  } | null;
  orderStatus?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
}

export interface SalesRepPerformance {
  id: string;
  name: string;
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  averageTicket: number;
  conversionRate: number;
  totalProducts: number;
  averageOrderValue: number;
  growthRate: number;
}

export interface TopProduct {
  id: string;
  name: string;
  code: number;
  totalQuantity: number;
  totalRevenue: number;
  ordersCount: number;
}

export interface ReportsData {
  orders?: Array<{
    id: string;
    code: number;
    date: Date;
    customerId: string;
    customerName: string;
    salesRepId: string;
    salesRepName: string;
    total: number;
    status: string;
    paymentMethod?: string;
    items?: Array<{
      id: string;
      productName: string;
      productCode: number;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  }>;
  salesRepPerformance?: SalesRepPerformance[];
  topProducts?: TopProduct[];
  summary?: {
    totalRevenue: number;
    totalOrders: number;
    activeCustomers: number;
    averageTicket: number;
  };
}

export interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  averageTicket: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  ticketChange: number;
}
