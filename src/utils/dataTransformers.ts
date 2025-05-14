/**
 * Transforms data from snake_case to camelCase or vice versa
 */

type CamelCase<T extends string> = T extends `${infer First}_${infer Rest}`
  ? `${First}${Capitalize<CamelCase<Rest>>}`
  : T;

type CamelCaseObject<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K] extends object ? CamelCaseObject<T[K]> : T[K]
};

/**
 * Convert snake_case keys to camelCase
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export function toCamelCase<T extends object>(obj: T): CamelCaseObject<T> {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj as unknown as CamelCaseObject<T>;
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) as keyof T;
    const value = obj[key as keyof T];
    const camelValue = value !== null && typeof value === 'object' && !Array.isArray(value)
      ? toCamelCase(value as object)
      : value;

    return {
      ...result,
      [camelKey]: camelValue
    };
  }, {} as CamelCaseObject<T>);
}

/**
 * Convert camelCase keys to snake_case
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function toSnakeCase<T extends object>(obj: T): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj as unknown as Record<string, unknown>;
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    const value = obj[key as keyof T];
    const snakeValue = value !== null && typeof value === 'object' && !Array.isArray(value)
      ? toSnakeCase(value as object)
      : value;

    return {
      ...result,
      [snakeKey]: snakeValue
    };
  }, {} as Record<string, unknown>);
}

/**
 * Transforms an object to prepare it for Supabase insert/update
 * Converts dates to ISO strings and camelCase to snake_case
 */
export const prepareForSupabase = (data: any): Record<string, unknown> => {
  // First, handle Date objects
  const processedData = Object.entries(data).reduce((acc, [key, value]) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      acc[key] = value.toISOString();
    } else if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);
  
  // Then convert to snake_case
  return toSnakeCase(processedData);
};

/**
 * Transform a Supabase product record to our internal Product type
 */
export const transformProductData = (data: any) => {
  const transformed = toCamelCase(data);
  return {
    ...transformed,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

/**
 * Transform a Supabase product category record to our internal ProductCategory type
 */
export const transformProductCategoryData = (data: any) => {
  const transformed = toCamelCase(data);
  return {
    ...transformed,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

/**
 * Transform a Supabase customer record to our internal Customer type
 */
export const transformCustomerData = (data: any) => {
  const transformed = toCamelCase(data);
  return {
    ...transformed,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

/**
 * Transform a Supabase sales rep record to our internal SalesRep type
 */
export const transformSalesRepData = (data: any) => {
  if (!data) return null;
  
  const transformed = toCamelCase(data);
  
  // Ensure all required properties are present
  if (!transformed.name) {
    console.error('Sales rep data missing required name:', data);
  }
  
  return {
    id: data.id || '',
    name: transformed.name || '',
    email: transformed.email || '',
    phone: transformed.phone || '',
    document: transformed.document || '',
    address: transformed.address || '',
    city: transformed.city || '',
    state: transformed.state || '',
    zip: transformed.zip || '',
    notes: transformed.notes || '',
    role: transformed.role || 'sales',
    active: transformed.active !== false, // Default to true if not explicitly false
    region: transformed.region || '',
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    visitDay: data.visit_day || '',
  };
};

/**
 * Transform a Supabase order record to our internal Order type
 */
export const transformOrderData = (data: any) => {
  if (!data) return null;
  
  const transformed = toCamelCase(data);
  return {
    id: data.id || '',
    code: transformed.code || 0,
    customerId: transformed.customerId || '',
    customerName: transformed.customerName || '',
    salesRepId: transformed.salesRepId || '',
    salesRepName: transformed.salesRepName || '',
    date: data.date ? new Date(data.date) : new Date(),
    dueDate: data.due_date ? new Date(data.due_date) : new Date(),
    items: transformed.items || [],
    total: transformed.total || 0,
    discount: transformed.discount || 0,
    status: transformed.status || 'pending',
    paymentStatus: transformed.paymentStatus || 'pending',
    paymentMethod: transformed.paymentMethod || '',
    paymentMethodId: transformed.paymentMethodId || '',
    paymentTableId: transformed.paymentTableId || '',
    payments: transformed.payments || [],
    notes: transformed.notes || '',
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    archived: transformed.archived || false,
    deliveryAddress: transformed.deliveryAddress || '',
    deliveryCity: transformed.deliveryCity || '',
    deliveryState: transformed.deliveryState || '',
    deliveryZip: transformed.deliveryZip || '',
  };
};

/**
 * Transform generic data from Supabase
 */
export const transformData = (data: any) => {
  const transformed = toCamelCase(data);
  
  // Handle standard timestamp fields if present
  const result = {
    ...transformed,
  };
  
  if (data.created_at) {
    result.createdAt = new Date(data.created_at);
  }
  
  if (data.updated_at) {
    result.updatedAt = new Date(data.updated_at);
  }
  
  if (data.date) {
    result.date = new Date(data.date);
  }
  
  return result;
};

/**
 * Transform an array of data using the provided transformer
 */
export const transformArray = (data: any[], transformer: (item: any) => any) => {
  if (!Array.isArray(data)) {
    console.error('transformArray received non-array input:', data);
    return [];
  }
  return data.map(transformer);
};
