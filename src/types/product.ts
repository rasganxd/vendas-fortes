
export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number; // This will be 0 initially and updated in pricing
  sale_price?: number; // Price from pricing table
  cost: number;
  stock: number;
  minStock: number;
  maxDiscountPercent?: number; // % máxima de desconto (0-100)
  max_discount_percent?: number; // Alternative naming for compatibility
  maxPrice?: number;
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string;
  subunit?: string;
  hasSubunit?: boolean;
  subunitRatio?: number; // Calculated automatically from units table
  main_unit_id?: string; // ID of main unit
  sub_unit_id?: string; // ID of sub unit
  createdAt: Date;
  updatedAt: Date;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface ProductGroup {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBrand {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
