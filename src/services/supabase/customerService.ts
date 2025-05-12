
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { transformCustomerData, prepareForSupabase } from '@/utils/dataTransformers';
import { Customer } from '@/types';

/**
 * Service for customer-related operations
 * This is a standardized service that handles the CRUD operations for customers
 */
export const customerService = createStandardService('customers');

// Cache for customer lookups by code
const customerCodeCache = new Map<number, Customer | null>();

/**
 * Get customer by code
 * @param code - Customer code
 * @returns Customer or null if not found
 */
export const getCustomerByCode = async (code: number): Promise<Customer | null> => {
  // Check cache first
  if (customerCodeCache.has(code)) {
    return customerCodeCache.get(code) || null;
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('code', code)
      .single();
      
    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error("Error fetching customer by code:", error);
      }
      customerCodeCache.set(code, null);
      return null;
    }
    
    const customer = transformCustomerData(data);
    customerCodeCache.set(code, customer);
    return customer;
  } catch (error) {
    console.error("Error in getCustomerByCode:", error);
    return null;
  }
};

/**
 * Create a new customer with automatic code generation if not provided
 * @param customer - Customer data (without id)
 * @returns ID of the created customer
 */
export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<string> => {
  try {
    // Ensure customer has a code
    let customerData = { ...customer };
    
    // If no code provided, get the next available one
    if (!customerData.code) {
      const { data: lastCustomer } = await supabase
        .from('customers')
        .select('code')
        .order('code', { ascending: false })
        .limit(1)
        .single();
      
      customerData.code = (lastCustomer?.code || 0) + 1;
    }
    
    // Ensure code is a number
    if (typeof customerData.code === 'string') {
      customerData.code = parseInt(customerData.code, 10);
    }
    
    // Ensure customer has required fields
    if (!customerData.name) {
      throw new Error("Customer name is required");
    }
    
    // Ensure visitDays is an array
    if (!Array.isArray(customerData.visitDays)) {
      customerData.visitDays = customerData.visitDays ? [customerData.visitDays] : [];
    }
    
    // Convert to snake_case and prepare for Supabase
    const supabaseData = prepareForSupabase(customerData);
    
    // Ensure the required fields are present in the data
    if (!supabaseData.name) {
      throw new Error("Customer name is required after transformation");
    }
    
    if (supabaseData.code === undefined) {
      throw new Error("Customer code is required after transformation");
    }
    
    const { data, error } = await supabase
      .from('customers')
      .insert(supabaseData as any)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
    
    // Clear cache for this code
    if (customerData.code) {
      customerCodeCache.delete(customerData.code);
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in createCustomer:", error);
    throw error;
  }
};
