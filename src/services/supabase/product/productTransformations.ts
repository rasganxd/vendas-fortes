
import { Product } from '@/types';

/**
 * Transform database product record to Product interface
 */
export const transformProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    code: dbProduct.code,
    name: dbProduct.name,
    description: dbProduct.description || '',
    cost: dbProduct.cost || 0,
    price: dbProduct.price || 0,
    stock: dbProduct.stock || 0,
    minStock: dbProduct.min_stock || 0,
    minPrice: dbProduct.min_price || undefined,
    maxPrice: dbProduct.max_price || undefined,
    unit: dbProduct.unit || 'UN',
    subunit: dbProduct.subunit || undefined,
    hasSubunit: dbProduct.has_subunit || false,
    subunitRatio: dbProduct.subunit_ratio || 1,
    categoryId: dbProduct.category_id,
    groupId: dbProduct.group_id,
    brandId: dbProduct.brand_id,
    mainUnitId: dbProduct.main_unit_id,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at),
    syncStatus: (dbProduct.sync_status || 'synced') as 'synced' | 'pending' | 'error'
  };
};

/**
 * Transform Product interface to database format for insert/update
 */
export const transformProductToDB = (product: Partial<Product> & { selectedUnits?: any[], mainUnitId?: string }) => {
  const dbProduct: any = {};
  
  if (product.code !== undefined) dbProduct.code = product.code;
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.cost !== undefined) dbProduct.cost = product.cost;
  if (product.price !== undefined) dbProduct.price = product.price;
  if (product.stock !== undefined) dbProduct.stock = product.stock;
  if (product.minStock !== undefined) dbProduct.min_stock = product.minStock;
  if (product.minPrice !== undefined) dbProduct.min_price = product.minPrice;
  if (product.maxPrice !== undefined) dbProduct.max_price = product.maxPrice;
  if (product.unit !== undefined) dbProduct.unit = product.unit;
  if (product.subunit !== undefined) dbProduct.subunit = product.subunit;
  if (product.hasSubunit !== undefined) dbProduct.has_subunit = product.hasSubunit;
  if (product.subunitRatio !== undefined) dbProduct.subunit_ratio = product.subunitRatio;
  if (product.categoryId !== undefined) dbProduct.category_id = product.categoryId;
  if (product.groupId !== undefined) dbProduct.group_id = product.groupId;
  if (product.brandId !== undefined) dbProduct.brand_id = product.brandId;
  if (product.mainUnitId !== undefined) dbProduct.main_unit_id = product.mainUnitId;
  if (product.syncStatus !== undefined) dbProduct.sync_status = product.syncStatus;

  return dbProduct;
};

/**
 * Prepare product data for database insert
 */
export const prepareProductForInsert = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { selectedUnits?: any[], mainUnitId?: string }) => {
  return {
    code: product.code,
    name: product.name,
    description: product.description || '',
    cost: product.cost || 0,
    price: product.price || 0,
    stock: product.stock || 0,
    min_stock: product.minStock || 0,
    min_price: product.minPrice || null,
    max_price: product.maxPrice || null,
    unit: product.unit || 'UN',
    subunit: product.subunit || null,
    has_subunit: product.hasSubunit || false,
    subunit_ratio: product.subunitRatio || 1,
    category_id: product.categoryId || null,
    group_id: product.groupId || null,
    brand_id: product.brandId || null,
    main_unit_id: product.mainUnitId || null,
    sync_status: product.syncStatus || 'synced'
  };
};
