
export interface LoadItem {
  id: string;
  load_id?: string;
  order_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Load {
  id: string;
  code: number;
  date: Date;
  status: string;
  notes?: string;
  total_value?: number;
  sales_rep_id?: string;
  vehicle_id?: string;
  createdAt: Date;
  updatedAt: Date;
}
