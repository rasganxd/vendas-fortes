import { SalesRep } from '@/types';
import { Customer } from '@/types';

/**
 * Transforms raw Supabase data to SalesRep interface
 * @param raw - Raw data from Supabase
 * @returns SalesRep object or null if transformation fails
 */
export const transformSalesRepData = (raw: any): SalesRep | null => {
  try {
    if (!raw || typeof raw !== 'object') {
      console.error('Invalid sales rep data:', raw);
      return null;
    }

    return {
      id: raw.id,
      code: raw.code || 0,
      name: raw.name || '',
      phone: raw.phone || '',
      email: raw.email || '',
      // Nota: senha nunca é incluída por segurança
      active: raw.active !== false, // Default to true if not specified
      createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date()
    };
  } catch (error) {
    console.error('Error transforming sales rep data:', error, 'Raw data:', raw);
    return null;
  }
};

/**
 * Transforms raw Supabase data to Customer interface
 * @param raw - Raw data from Supabase
 * @returns Customer object or null if transformation fails
 */
export const transformCustomerData = (raw: any): Customer | null => {
  try {
    if (!raw || typeof raw !== 'object') {
      console.error('Invalid customer data:', raw);
      return null;
    }

    return {
      id: raw.id,
      code: raw.code || 0,
      name: raw.name || '',
      companyName: raw.company_name || '',
      document: raw.document || '',
      email: raw.email || '',
      phone: raw.phone || '',
      address: raw.address || '',
      city: raw.city || '',
      state: raw.state || '',
      zip: raw.zip_code || '',
      zipCode: raw.zip_code || '',
      visitFrequency: raw.visit_frequency || '',
      visitDays: raw.visit_days || [],
      visitSequence: raw.visit_sequence || 0,
      salesRepId: raw.sales_rep_id || '',
      deliveryRouteId: raw.delivery_route_id || '',
      notes: raw.notes || '',
      createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date()
    };
  } catch (error) {
    console.error('Error transforming customer data:', error, 'Raw data:', raw);
    return null;
  }
};

/**
 * Transforms raw Supabase data to Product interface
 * @param raw - Raw data from Supabase
 * @returns Product object or null if transformation fails
 */
export const transformProductData = (raw: any): any | null => {
  try {
    if (!raw || typeof raw !== 'object') {
      console.error('Invalid product data:', raw);
      return null;
    }

    return {
      id: raw.id,
      code: raw.code || 0,
      name: raw.name || '',
      brand: raw.brand || '',
      category: raw.category || '',
      group: raw.group || '',
      unit: raw.unit || 'UN',
      price: raw.price || 0,
      cost: raw.cost || 0,
      active: raw.active !== false,
      createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date()
    };
  } catch (error) {
    console.error('Error transforming product data:', error, 'Raw data:', raw);
    return null;
  }
};

/**
 * Transforms raw Supabase data to Order interface
 * @param raw - Raw data from Supabase
 * @returns Order object or null if transformation fails
 */
export const transformOrderData = (raw: any): any | null => {
  try {
    if (!raw || typeof raw !== 'object') {
      console.error('Invalid order data:', raw);
      return null;
    }

    return {
      id: raw.id,
      code: raw.code || 0,
      customerId: raw.customer_id || '',
      customerName: raw.customer_name || '',
      salesRepId: raw.sales_rep_id || '',
      salesRepName: raw.sales_rep_name || '',
      date: raw.date ? new Date(raw.date) : new Date(),
      dueDate: raw.due_date ? new Date(raw.due_date) : null,
      total: raw.total || 0,
      discount: raw.discount || 0,
      status: raw.status || 'pending',
      paymentStatus: raw.payment_status || 'pending',
      paymentMethod: raw.payment_method || '',
      notes: raw.notes || '',
      createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date()
    };
  } catch (error) {
    console.error('Error transforming order data:', error, 'Raw data:', raw);
    return null;
  }
};

/**
 * Prepares data for Supabase insertion (converts camelCase to snake_case)
 * @param entity - Entity object to prepare
 * @returns Prepared object for Supabase
 */
export const prepareForSupabase = (entity: any): any => {
  try {
    if (!entity || typeof entity !== 'object') {
      return entity;
    }

    const prepared: any = {};
    
    // Map common fields
    for (const [key, value] of Object.entries(entity)) {
      switch (key) {
        case 'createdAt':
          prepared.created_at = value instanceof Date ? value.toISOString() : value;
          break;
        case 'updatedAt':
          prepared.updated_at = value instanceof Date ? value.toISOString() : value;
          break;
        case 'companyName':
          prepared.company_name = value;
          break;
        case 'zipCode':
          prepared.zip_code = value;
          break;
        case 'paymentTerms':
          prepared.payment_terms = value;
          break;
        case 'creditLimit':
          prepared.credit_limit = value;
          break;
        case 'visitFrequency':
          prepared.visit_frequency = value;
          break;
        case 'visitDays':
          prepared.visit_days = value;
          break;
        case 'visitSequence':
          prepared.visit_sequence = value;
          break;
        case 'salesRepId':
          prepared.sales_rep_id = value;
          break;
        case 'deliveryRouteId':
          prepared.delivery_route_id = value;
          break;
        default:
          prepared[key] = value;
      }
    }

    return prepared;
  } catch (error) {
    console.error('Error preparing data for Supabase:', error);
    return entity;
  }
};
