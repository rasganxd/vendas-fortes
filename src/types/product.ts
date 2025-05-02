
export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxDiscountPercentage?: number;
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  createdAt: Date;
  updatedAt: Date;
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
