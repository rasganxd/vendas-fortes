
export interface ImportHistoryRecord {
  id: string;
  timestamp: Date;
  operationType: 'import' | 'reject';
  operator: string;
  ordersCount: number;
  totalValue: number;
  salesRepsCount: number;
  reportData: any;
  createdAt: Date;
}
