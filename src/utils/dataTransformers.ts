
// Utilities for converting data between Supabase format (snake_case) and app format (camelCase)

// Helper function to convert snake_case strings to camelCase
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper function to convert camelCase strings to snake_case
export const camelToSnake = (str: string): string => {
  return str.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
};

// Function to convert string dates to Date objects
export const convertStringToDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  return new Date(dateString);
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

// Transformers for specific entity types
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

// Customer transformer
export const transformCustomerData = (data: any): any => {
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
    zipCode: camelCaseData.zip || "",
    document: camelCaseData.document || "",
    notes: camelCaseData.notes || "",
    visitDays: camelCaseData.visitDays || [],
    visitFrequency: camelCaseData.visitFrequency || "",
    visitSequence: camelCaseData.visitSequence || 0,
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

// Generic function to transform arrays of data
export const transformArray = <T>(data: any[], transformer: (item: any) => T): T[] => {
  if (!data || !Array.isArray(data)) return [] as T[];
  return data.map(item => transformer(item));
};

// Function to prepare data for sending to Supabase (convert to snake_case)
export const prepareForSupabase = (data: Record<string, any>): Record<string, any> => {
  const result = convertToSnakeCase(data);
  
  // Handle specific date properties that need to be converted to ISO strings
  if (data.createdAt instanceof Date) {
    result.created_at = data.createdAt.toISOString();
  }
  
  if (data.updatedAt instanceof Date) {
    result.updated_at = data.updatedAt.toISOString();
  }
  
  if (data.date instanceof Date) {
    result.date = data.date.toISOString();
  }
  
  if (data.dueDate instanceof Date) {
    result.due_date = data.dueDate.toISOString();
  }
  
  return result;
};
