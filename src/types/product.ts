
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
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string; // DEPRECATED: Use product_units_mapping table
  subunit?: string; // DEPRECATED: Use product_units_mapping table
  hasSubunit?: boolean; // DEPRECATED: Use product_units_mapping table
  subunitRatio?: number; // DEPRECATED: Use product_units_mapping table
  mainUnitId?: string; // New field for main unit reference
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

export interface ProductDiscountSetting {
  id: string;
  productId: string;
  maxDiscountPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
