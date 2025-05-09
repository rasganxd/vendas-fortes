
import { createClient } from '@supabase/supabase-js';
import { 
  Customer, 
  Product, 
  Order, 
  OrderItem, 
  Payment, 
  SalesRep, 
  Vehicle, 
  PaymentMethod, 
  PaymentTable,
  ProductGroup,
  ProductCategory,
  ProductBrand,
  DeliveryRoute,
  Load
} from '@/types';

// Create Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Function to convert Supabase timestamps to Date objects
const convertTimestampsToDates = <T extends Record<string, any>>(data: T): T => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const dateFields = ['created_at', 'updated_at', 'date', 'due_date', 'createdAt', 'updatedAt'];
  
  const result = { ...data };
  
  for (const key in result) {
    if (dateFields.includes(key) && result[key]) {
      result[key] = new Date(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertTimestampsToDates(result[key]);
    }
  }
  
  return result;
};

// Function to transform camelCase to snake_case for Supabase
export const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== 'object' || obj instanceof Date || Array.isArray(obj)) {
    return obj;
  }
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        if (Array.isArray(obj[key])) {
          result[snakeKey] = obj[key].map((item: any) => 
            typeof item === 'object' && item !== null ? toSnakeCase(item) : item
          );
        } else {
          result[snakeKey] = toSnakeCase(obj[key]);
        }
      } else {
        result[snakeKey] = obj[key];
      }
    }
  }
  
  return result;
};

// Function to transform snake_case to camelCase from Supabase
export const toCamelCase = <T extends Record<string, any>>(obj: Record<string, any>): T => {
  if (!obj || typeof obj !== 'object' || obj instanceof Date || Array.isArray(obj)) {
    return obj as T;
  }
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        if (Array.isArray(obj[key])) {
          result[camelKey] = obj[key].map((item: any) => 
            typeof item === 'object' && item !== null ? toCamelCase(item) : item
          );
        } else {
          result[camelKey] = toCamelCase(obj[key]);
        }
      } else {
        result[camelKey] = obj[key];
      }
    }
  }
  
  return result as T;
};

// Create generic service for CRUD operations
const createService = <T extends { id?: string }>(tableName: string) => {
  return {
    getAll: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      
      return data.map(item => convertTimestampsToDates(toCamelCase<T>(item)));
    },
    
    add: async (item: Omit<T, 'id'>): Promise<string> => {
      // Set timestamps if they don't exist
      const itemWithTimestamps = {
        ...item,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      };

      // Convert the object to snake_case for Supabase
      const snakeCaseItem = toSnakeCase(itemWithTimestamps);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(snakeCaseItem)
        .select();
        
      if (error) {
        console.error(`Error adding to ${tableName}:`, error);
        throw error;
      }
      
      return data[0].id;
    },
    
    getById: async (id: string): Promise<T | null> => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error(`Error fetching ${tableName} by ID:`, error);
        throw error;
      }
      
      return convertTimestampsToDates(toCamelCase<T>(data));
    },
    
    update: async (id: string, item: Partial<T>): Promise<void> => {
      // Add updated timestamp
      const itemWithTimestamp = {
        ...item,
        updatedAt: new Date()
      };

      // Convert the object to snake_case for Supabase
      const snakeCaseItem = toSnakeCase(itemWithTimestamp);
      
      const { error } = await supabase
        .from(tableName)
        .update(snakeCaseItem)
        .eq('id', id);
        
      if (error) {
        console.error(`Error updating ${tableName}:`, error);
        throw error;
      }
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        throw error;
      }
    }
  };
};

// Specific services
export const customerService = createService<Customer>('customers');
export const productService = createService<Product>('products');
export const productGroupService = createService<ProductGroup>('product_groups');
export const productCategoryService = createService<ProductCategory>('product_categories');
export const productBrandService = createService<ProductBrand>('product_brands');
export const paymentTableService = createService<PaymentTable>('payment_tables');
export const paymentMethodService = createService<PaymentMethod>('payment_methods');
export const salesRepService = createService<SalesRep>('sales_reps');
export const vehicleService = createService<Vehicle>('vehicles');
export const routeService = createService<DeliveryRoute>('routes');
export const loadService = createService<Load>('loads');
export const paymentService = createService<Payment>('payments');

// Specialized service for orders due to relationship with items
export const orderService = {
  getAll: async (): Promise<Order[]> => {
    // Fetch orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    
    // Transform to camelCase and convert timestamps
    const camelCaseOrders = orders.map(order => convertTimestampsToDates(toCamelCase<Order>(order)));
    
    // For each order, fetch related items
    const ordersWithItems = await Promise.all(
      camelCaseOrders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
          
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          return { ...order, items: [] };
        }
        
        const camelCaseItems = items.map(item => toCamelCase(item) as OrderItem);
        return { ...order, items: camelCaseItems };
      })
    );
    
    return ordersWithItems;
  },
  
  add: async (order: Omit<Order, 'id'>): Promise<string> => {
    // Extract order items
    const { items, ...orderData } = order;
    
    // Add timestamps
    const orderWithTimestamps = {
      ...orderData,
      createdAt: orderData.createdAt || new Date(),
      updatedAt: orderData.updatedAt || new Date()
    };

    // Start a transaction
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(toSnakeCase(orderWithTimestamps))
      .select();
      
    if (orderError) {
      console.error('Error adding order:', orderError);
      throw orderError;
    }
    
    const orderId = orderResult[0].id;
    
    // Add each order item linked to the created order
    if (items && items.length > 0) {
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: orderId
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsWithOrderId.map(item => toSnakeCase(item)));
        
      if (itemsError) {
        console.error('Error adding order items:', itemsError);
        // Maybe delete the order in case of item failure?
        throw itemsError;
      }
    }
    
    return orderId;
  },
  
  update: async (id: string, orderData: Partial<Order>): Promise<string> => {
    const { items, ...orderWithoutItems } = orderData;
    
    // Add updated timestamp
    const orderWithTimestamp = {
      ...orderWithoutItems,
      updatedAt: new Date()
    };

    // Update order data
    if (Object.keys(orderWithTimestamp).length > 0) {
      const { error: orderError } = await supabase
        .from('orders')
        .update(toSnakeCase(orderWithTimestamp))
        .eq('id', id);
        
      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }
    }
    
    // If there are items to update
    if (items && items.length > 0) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
        
      if (deleteError) {
        console.error('Error deleting order items:', deleteError);
        throw deleteError;
      }
      
      // Insert new items
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: id
      }));
      
      const { error: insertError } = await supabase
        .from('order_items')
        .insert(orderItemsWithOrderId.map(item => toSnakeCase(item)));
        
      if (insertError) {
        console.error('Error inserting new order items:', insertError);
        throw insertError;
      }
    }

    return id;
  },
  
  getById: async (id: string): Promise<Order | null> => {
    // Fetch the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching order by ID:', error);
      throw error;
    }
    
    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
      
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw itemsError;
    }
    
    const camelCaseOrder = convertTimestampsToDates(toCamelCase<Order>(order));
    const camelCaseItems = items.map(item => toCamelCase(item) as OrderItem);
    
    return { ...camelCaseOrder, items: camelCaseItems };
  },
  
  delete: async (id: string): Promise<void> => {
    // Delete order items first
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);
      
    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw itemsError;
    }
    
    // Then delete the order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
      
    if (orderError) {
      console.error('Error deleting order:', orderError);
      throw orderError;
    }
  }
};
