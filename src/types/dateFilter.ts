
export type DatePeriod = 
  | 'all'
  | 'today' 
  | 'yesterday' 
  | 'this_week' 
  | 'last_week' 
  | 'this_month'
  | 'last_month';

export interface DateFilter {
  period: DatePeriod;
  label: string;
  count?: number;
}

export interface DateFilterOption {
  value: DatePeriod;
  label: string;
}
