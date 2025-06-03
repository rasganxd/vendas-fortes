
export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number; // This will be 0 initially and updated in pricing
  sale_price?: number; // Price from database
  cost: number;
  stock: number;
  minStock: number;
  maxDiscountPercent?: number; // % máxima de desconto (0-100)
  maxPrice?: number;
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string;
  subunit?: string;
  hasSubunit?: boolean;
  subunitRatio?: number; // Calculated automatically from units table
  main_unit_id?: string; // Main unit ID from database
  sub_unit_id?: string; // Sub unit ID from database
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
