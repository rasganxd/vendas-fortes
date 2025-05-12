
// Utilities for converting data between Supabase format (snake_case) and app format (camelCase)

// Helper function to convert snake_case strings to camelCase
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper function to convert camelCase strings to snake_case
export const camelToSnake = (str: string): string => {
  return str.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
};

// Cache for converted objects to avoid repeated transformations
const transformCache = new Map<string, any>();
const CACHE_SIZE_LIMIT = 100;

// Convert a Supabase record to camelCase format with caching
export const convertToCamelCase = (data: Record<string, any>): Record<string, any> => {
  if (!data) return {};
  
  // Generate a cache key based on the data
  const cacheKey = `camel_${JSON.stringify(data)}`;
  
  // Check if we have a cached version
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }
  
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = data[key];
    }
  }
  
  // Store in cache (with size limit)
  if (transformCache.size >= CACHE_SIZE_LIMIT) {
    // Remove oldest entry
    const firstKey = transformCache.keys().next().value;
    transformCache.delete(firstKey);
  }
  transformCache.set(cacheKey, result);
  
  return result;
};

// Convert a camelCase record to snake_case format for Supabase with caching
export const convertToSnakeCase = (data: Record<string, any>): Record<string, any> => {
  if (!data) return {};
  
  // Generate a cache key based on the data
  const cacheKey = `snake_${JSON.stringify(data)}`;
  
  // Check if we have a cached version
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }
  
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = data[key];
    }
  }
  
  // Store in cache (with size limit)
  if (transformCache.size >= CACHE_SIZE_LIMIT) {
    // Remove oldest entry
    const firstKey = transformCache.keys().next().value;
    transformCache.delete(firstKey);
  }
  transformCache.set(cacheKey, result);
  
  return result;
};

// Function to safely convert string dates to Date objects
export const convertStringToDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

// Customer transformer with consistent zip/zipCode handling and reduced transformations
export const transformCustomerData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: typeof camelCaseData.code === 'number' ? camelCaseData.code : 
          typeof camelCaseData.code === 'string' ? parseInt(camelCaseData.code, 10) : 0,
    name: camelCaseData.name || "",
    phone: camelCaseData.phone || "",
    email: camelCaseData.email || "",
    address: camelCaseData.address || "",
    city: camelCaseData.city || "",
    state: camelCaseData.state || "",
    zip: camelCaseData.zip || "",
    document: camelCaseData.document || "",
    notes: camelCaseData.notes || "",
    visitDays: Array.isArray(camelCaseData.visitDays) ? camelCaseData.visitDays : [],
    visitFrequency: camelCaseData.visitFrequency || "",
    visitSequence: camelCaseData.visitSequence || 0,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
  };
};

// SalesRep transformer with optimized transformation
export const transformSalesRepData = (data: any): any => {
  if (!data) return null;

  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: typeof camelCaseData.code === 'number' ? camelCaseData.code : 
          typeof camelCaseData.code === 'string' ? parseInt(camelCaseData.code, 10) : 0,
    name: camelCaseData.name || "",
    phone: camelCaseData.phone || "",
    email: camelCaseData.email || "",
    address: camelCaseData.address || "",
    city: camelCaseData.city || "",
    state: camelCaseData.state || "",
    zip: camelCaseData.zip || "",
    region: camelCaseData.region || "",
    document: camelCaseData.document || "",
    role: camelCaseData.role || "",
    active: camelCaseData.active !== undefined ? camelCaseData.active : true,
    notes: camelCaseData.notes || "",
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
  };
};

// Product transformer with optimized transformation
export const transformProductData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: typeof camelCaseData.code === 'number' ? camelCaseData.code : 
          typeof camelCaseData.code === 'string' ? parseInt(camelCaseData.code, 10) : 0,
    name: camelCaseData.name || "",
    description: camelCaseData.description || "",
    price: camelCaseData.price || 0,
    cost: camelCaseData.cost || 0,
    stock: camelCaseData.stock || 0,
    minStock: camelCaseData.minStock || 0,
    maxDiscountPercentage: camelCaseData.maxDiscountPercentage,
    groupId: camelCaseData.groupId,
    categoryId: camelCaseData.categoryId,
    brandId: camelCaseData.brandId,
    unit: camelCaseData.unit || "",
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
  };
};

// Order transformer with optimized transformation
export const transformOrderData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: typeof camelCaseData.code === 'number' ? camelCaseData.code : 
          typeof camelCaseData.code === 'string' ? parseInt(camelCaseData.code, 10) : 0,
    customerId: camelCaseData.customerId || "",
    customerName: camelCaseData.customerName || "",
    salesRepId: camelCaseData.salesRepId || "",
    salesRepName: camelCaseData.salesRepName || "",
    date: data.date ? new Date(data.date) : new Date(),
    dueDate: data.due_date ? new Date(data.due_date) : new Date(),
    items: camelCaseData.items || [],
    total: camelCaseData.total || 0,
    discount: camelCaseData.discount || 0,
    status: camelCaseData.status || 'pending',
    paymentStatus: camelCaseData.paymentStatus || 'pending',
    paymentMethodId: camelCaseData.paymentMethodId || "",
    paymentMethod: camelCaseData.paymentMethod || "",
    paymentTableId: camelCaseData.paymentTableId || "",
    payments: camelCaseData.payments || [],
    notes: camelCaseData.notes || "",
    archived: camelCaseData.archived || false,
    deliveryZip: camelCaseData.deliveryZip || "",
    deliveryAddress: camelCaseData.deliveryAddress || "",
    deliveryCity: camelCaseData.deliveryCity || "",
    deliveryState: camelCaseData.deliveryState || "",
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
  };
};

// Function to prepare data for sending to Supabase (convert to snake_case)
export function prepareForSupabase(data: Record<string, any>): Record<string, any> {
  // Create a copy to avoid mutating the original
  const processedData = { ...data };
  
  // Handle special fields before conversion
  // Remove zipCode field if present to avoid duplication (we just use zip)
  if (processedData.zipCode !== undefined) {
    processedData.zip = processedData.zipCode;
    delete processedData.zipCode;
  }
  
  // Ensure code is always a number
  if (processedData.code !== undefined) {
    processedData.code = typeof processedData.code === 'string' ? 
                         parseInt(processedData.code, 10) : 
                         processedData.code;
  }
  
  // Special field mapping for products
  // Map categoryId to category_id
  if (processedData.categoryId !== undefined) {
    processedData.category_id = processedData.categoryId;
    delete processedData.categoryId;
  }
  
  // Map groupId to group_id
  if (processedData.groupId !== undefined) {
    processedData.group_id = processedData.groupId;
    delete processedData.groupId;
  }
  
  // Map brandId to brand_id
  if (processedData.brandId !== undefined) {
    processedData.brand_id = processedData.brandId;
    delete processedData.brandId;
  }
  
  // Map minStock to min_stock
  if (processedData.minStock !== undefined) {
    processedData.min_stock = processedData.minStock;
    delete processedData.minStock;
  }
  
  // Map maxDiscountPercentage to max_discount_percentage
  if (processedData.maxDiscountPercentage !== undefined) {
    processedData.max_discount_percentage = processedData.maxDiscountPercentage;
    delete processedData.maxDiscountPercentage;
  }
  
  // Ensure price is set
  if (processedData.price === undefined || processedData.price === null) {
    processedData.price = 0;
  }
  
  // Convert all remaining fields to snake_case for Supabase
  const snakeCaseData = convertToSnakeCase(processedData);
  
  // Validate required fields are present
  if (!snakeCaseData.name || snakeCaseData.name.trim() === '') {
    throw new Error("Name is required");
  }
  
  if (snakeCaseData.code === undefined || snakeCaseData.code === null) {
    throw new Error("Code is required");
  }
  
  return snakeCaseData;
}

// Generic function to transform arrays of data
export const transformArray = <T>(data: any[], transformer: (item: any) => T): T[] => {
  if (!data || !Array.isArray(data)) return [] as T[];
  return data.map(item => transformer(item));
};
