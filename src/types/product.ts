
export interface Product {
  id: string;
  code: number;
  name: string;
  main_unit_id: string;
  sub_unit_id?: string;
  cost_price: number;
  price?: number; // Add price property
  cost?: number; // Alias for cost_price
  stock: number;
  category_id?: string;
  group_id?: string;
  brand_id?: string;
  active: boolean;
  unit?: string; // Add unit property
  subunit?: string; // Add subunit property
  hasSubunit?: boolean; // Add hasSubunit property
  subunitRatio?: number; // Add subunitRatio property
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductGroup {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBrand {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
