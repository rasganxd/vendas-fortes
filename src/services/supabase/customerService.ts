
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { prepareForSupabase, transformCustomerData } from '@/utils/dataTransformers';
import { Customer } from '@/types';

/**
 * Service for customer-related operations
 */
export const customerService = createStandardService('customers');

/**
 * Get customer by code
 * @param code - Customer code
 * @returns Customer or null if not found
 */
export const getCustomerByCode = async (code: number): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('code', code)
      .single();
      
    if (error) {
      console.error("Error fetching customer by code:", error);
      return null;
    }
    
    return transformCustomerData(data);
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
    
    console.log("Creating customer with data:", customerData);
    
    // Convert to snake_case and prepare for Supabase
    const supabaseData = prepareForSupabase(customerData);
    
    console.log("Data prepared for Supabase:", supabaseData);
    
    // Validate required fields are present with correct types
    if (typeof supabaseData.name !== 'string' || !supabaseData.name) {
      throw new Error("Customer name is missing or invalid after transformation");
    }
    
    if (typeof supabaseData.code !== 'number') {
      if (typeof supabaseData.code === 'string' && !isNaN(parseInt(supabaseData.code as string, 10))) {
        supabaseData.code = parseInt(supabaseData.code as string, 10);
      } else {
        throw new Error("Customer code must be a number");
      }
    }
    
    // Create a properly typed object for Supabase insert
    // This ensures we match the exact type expected by Supabase
    const insertData = {
      name: supabaseData.name as string,
      code: supabaseData.code as number,
      phone: supabaseData.phone as string | null,
      email: supabaseData.email as string | null,
      address: supabaseData.address as string | null,
      city: supabaseData.city as string | null,
      state: supabaseData.state as string | null,
      zip: supabaseData.zip as string | null,
      notes: supabaseData.notes as string | null,
      document: supabaseData.document as string | null,
      sales_rep_id: supabaseData.sales_rep_id as string | null,
      sales_rep_name: supabaseData.sales_rep_name as string | null,
      created_at: supabaseData.created_at as string | null || new Date().toISOString(),
      updated_at: supabaseData.updated_at as string | null || new Date().toISOString()
    };
    
    console.log("Typed data for insert:", insertData);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in createCustomer:", error);
    throw error;
  }
};

/**
 * Update an existing customer
 * @param id - Customer ID
 * @param customer - Updated customer data
 */
export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<void> => {
  try {
    console.log("Updating customer with data:", customer);
    
    // Prepare data for Supabase
    const supabaseData = prepareForSupabase(customer);
    
    console.log("Data prepared for Supabase update:", supabaseData);
    
    const { error } = await supabase
      .from('customers')
      .update(supabaseData)
      .eq('id', id);
      
    if (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    throw error;
  }
};
