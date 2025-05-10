// Utilities for converting data between Supabase format (snake_case) and app format (camelCase)

// Helper function to convert snake_case strings to camelCase
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper function to convert camelCase strings to snake_case
export const camelToSnake = (str: string): string => {
  return str.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
};

// Convert a Supabase record to camelCase format
export const convertToCamelCase = (data: Record<string, any>): Record<string, any> => {
  if (!data) return {};
  
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = data[key];
    }
  }
  
  return result;
};

// Convert a camelCase record to snake_case format for Supabase
export const convertToSnakeCase = (data: Record<string, any>): Record<string, any> => {
  if (!data) return {};
  
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = data[key];
    }
  }
  
  return result;
};

// Function to safely convert string dates to Date objects
export const convertStringToDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

// Customer transformer with consistent zip/zipCode handling
export const transformCustomerData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: typeof camelCaseData.code === 'string' ? parseInt(camelCaseData.code, 10) : camelCaseData.code || 0,
    name: camelCaseData.name || "",
    phone: camelCaseData.phone || "",
    email: camelCaseData.email || "",
    address: camelCaseData.address || "",
    city: camelCaseData.city || "",
    state: camelCaseData.state || "",
    // Use zip only (zipCode is now just an alias for backward compatibility)
    zip: camelCaseData.zip || "",
    document: camelCaseData.document || "",
    notes: camelCaseData.notes || "",
    // Ensure visitDays is always an array
    visitDays: Array.isArray(camelCaseData.visitDays) ? camelCaseData.visitDays : [],
    visitFrequency: camelCaseData.visitFrequency || "",
    visitSequence: camelCaseData.visitSequence || 0,
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
  };
};

// Other transformers like product, salesRep, etc.
// SalesRep transformer
export const transformSalesRepData = (data: any): any => {
  if (!data) return null;

  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: camelCaseData.code || 0,
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
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
  };
};

// Product transformer
export const transformProductData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: camelCaseData.code || 0,
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
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
  };
};

// Order transformer
export const transformOrderData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    code: camelCaseData.code || 0,
    customerId: camelCaseData.customerId || "",
    customerName: camelCaseData.customerName || "",
    salesRepId: camelCaseData.salesRepId || "",
    salesRepName: camelCaseData.salesRepName || "",
    date: convertStringToDate(data.date),
    dueDate: convertStringToDate(data.due_date),
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
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
  };
};

// Vehicle transformer
export const transformVehicleData = (data: any): any => {
  if (!data) return null;
  
  const camelCaseData = convertToCamelCase(data);
  
  return {
    id: camelCaseData.id || "",
    name: camelCaseData.name || "",
    type: camelCaseData.type || "car",
    licensePlate: camelCaseData.licensePlate || "",
    model: camelCaseData.model || "",
    capacity: camelCaseData.capacity || 0,
    active: camelCaseData.active !== undefined ? camelCaseData.active : true,
    status: camelCaseData.status || "",
    notes: camelCaseData.notes || "",
    driverName: camelCaseData.driverName || "",
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
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
  
  // Handle date fields to ensure they are properly formatted as ISO strings
  if (processedData.createdAt instanceof Date) {
    processedData.created_at = processedData.createdAt.toISOString();
    delete processedData.createdAt;
  }
  
  if (processedData.updatedAt instanceof Date) {
    processedData.updated_at = processedData.updatedAt.toISOString();
    delete processedData.updatedAt;
  }
  
  if (processedData.date instanceof Date) {
    processedData.date = processedData.date.toISOString();
  }
  
  if (processedData.dueDate instanceof Date) {
    processedData.due_date = processedData.dueDate.toISOString();
    delete processedData.dueDate;
  }
  
  // Ensure code is always a number
  if (processedData.code !== undefined && typeof processedData.code !== 'number') {
    processedData.code = parseInt(processedData.code, 10);
  }
  
  // Convert all other fields to snake_case for Supabase
  return convertToSnakeCase(processedData);
}

// Generic function to transform arrays of data
export const transformArray = <T>(data: any[], transformer: (item: any) => T): T[] => {
  if (!data || !Array.isArray(data)) return [] as T[];
  return data.map(item => transformer(item));
};

// Export remaining transformers for other entities
export {
  transformSalesRepData,
  transformProductData,
  transformOrderData,
  transformVehicleData
};
