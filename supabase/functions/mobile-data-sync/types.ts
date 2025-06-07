
export interface SyncRequest {
  salesRepCode?: number;
  lastSync?: string;
  action?: 'get_sales_rep' | 'get_customers' | 'get_products' | 'sync_orders';
}
