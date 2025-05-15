
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { prepareForSupabase, transformCustomerData } from '@/utils/dataTransformers';
import { Customer } from '@/types';
import { TableInsert, TableUpdate } from './types';

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
    
    // Make sure code and name are included for TypeScript validation
    if (!('code' in supabaseData) || !('name' in supabaseData)) {
      throw new Error("Required fields missing after data transformation");
    }
    
    // Type cast to the Supabase expected type
    const insertData: TableInsert<"customers"> = {
      ...supabaseData as any,
      code: customerData.code,
      name: customerData.name
    };
    
    console.log("Data prepared for Supabase:", insertData);
    
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
    
    // Ensure we explicitly include any required fields for TypeScript validation
    const updateData: TableUpdate<"customers"> = {
      ...supabaseData as any,
    };
    
    // If code is provided, ensure it's properly typed
    if (customer.code !== undefined) {
      updateData.code = typeof customer.code === 'string' 
        ? parseInt(customer.code, 10) 
        : customer.code;
    }
    
    // If name is provided, include it explicitly
    if (customer.name !== undefined) {
      updateData.name = customer.name;
    }
    
    console.log("Data prepared for Supabase update:", updateData);
    
    const { error } = await supabase
      .from('customers')
      .update(updateData)
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
