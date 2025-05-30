
export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  minPrice?: number; // DEPRECATED: Use maxDiscountPercentage instead
  maxPrice?: number; // DEPRECATED: Use maxDiscountPercentage instead
  maxDiscountPercentage?: number; // New field for percentage-based discount validation
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string;
  subunit?: string;
  hasSubunit?: boolean;
  subunitRatio?: number;
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
