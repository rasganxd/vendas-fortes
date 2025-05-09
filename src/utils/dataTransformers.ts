
// Utilitários para converter dados do formato do Supabase para os formatos esperados pelo app

// Função para converter datas em string para objetos Date
export const convertStringToDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

// Conversor para SalesRep
export const transformSalesRepData = (data: any): any => {
  if (!data) return null;

  return {
    id: data.id || "",
    code: data.code || 0,
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    city: data.city || "",
    state: data.state || "",
    zip: data.zip || "",
    region: data.region || "",
    document: data.document || "",
    role: data.role || "",
    active: data.active !== undefined ? data.active : true,
    notes: data.notes || "",
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
  };
};

// Conversor para Product
export const transformProductData = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id || "",
    code: data.code || 0,
    name: data.name || "",
    description: data.description || "",
    price: data.price || 0,
    cost: data.cost || 0,
    stock: data.stock || 0,
    minStock: data.min_stock || 0,
    maxDiscountPercentage: data.max_discount_percentage,
    groupId: data.group_id,
    categoryId: data.category_id,
    brandId: data.brand_id,
    unit: data.unit || "",
    createdAt: convertStringToDate(data.created_at),
    updatedAt: convertStringToDate(data.updated_at)
  };
};

// Função genérica para transformar arrays de dados
export const transformArray = <T>(data: any[], transformer: (item: any) => T): T[] => {
  if (!data || !Array.isArray(data)) return [] as T[];
  return data.map(item => transformer(item));
};
