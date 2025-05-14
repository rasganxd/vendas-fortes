import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { prepareForSupabase } from '@/utils/dataTransformers';
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
    
    return transformCustomer(data);
  } catch (error) {
    console.error("Error in getCustomerByCode:", error);
    return null;
  }
};

/**
 * Transform customer from Supabase format to application format
 * @param data - Customer data from Supabase
 * @returns Customer object
 */
export const transformCustomer = (data: any): Customer => {
  if (!data) return null;

  const customer: Customer = {
    id: data.id,
    code: data.code,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    document: data.document || '',
    sales_rep_id: data.sales_rep_id,
    sales_rep_name: data.sales_rep_name || '',
    notes: data.notes || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zip: data.zip || '',
    visitDays: data.visit_days || [],
    visitFrequency: data.visit_frequency || '',
    visitSequence: data.visit_sequence,
    version: data.version || 1,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
  };

  return customer;
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
    
    // Convert to snake_case and prepare for Supabase
    const supabaseData = prepareForSupabase(customerData);
    
    // Ensure the required fields are present in the data
    if (!supabaseData.name) {
      throw new Error("Customer name is required after transformation");
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
    // Prepare data for Supabase
    const supabaseData = prepareForSupabase(customer);
    
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
