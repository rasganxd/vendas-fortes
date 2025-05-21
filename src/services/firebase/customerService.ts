
import { Customer } from '@/types';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';

/**
 * Get customer by code
 * @param code Customer code
 * @returns Customer or null if not found
 */
export const getCustomerByCode = async (code: number): Promise<Customer | null> => {
  try {
    const q = query(collection(db, 'customers'), where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      code: data.code,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      document: data.document || '',
      notes: data.notes || '',
      salesRepId: data.salesRepId || '',
      deliveryRouteId: data.deliveryRouteId || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
    };
  } catch (error) {
    console.error("Error getting customer by code:", error);
    return null;
  }
};

/**
 * Load all customers from Firebase
 */
export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    const customers: Customer[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      customers.push({
        id: doc.id,
        code: data.code,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        document: data.document || '',
        notes: data.notes || '',
        salesRepId: data.salesRepId || '',
        deliveryRouteId: data.deliveryRouteId || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
      });
    });
    
    return customers;
  } catch (error) {
    console.error("Error loading customers:", error);
    return [];
  }
};

/**
 * Get customer by ID
 * @param id Customer ID
 * @returns Customer or null if not found
 */
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      code: data.code,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      document: data.document || '',
      notes: data.notes || '',
      salesRepId: data.salesRepId || '',
      deliveryRouteId: data.deliveryRouteId || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
    };
  } catch (error) {
    console.error("Error getting customer by ID:", error);
    return null;
  }
};

/**
 * Add a new customer
 * @param customer Customer to add
 * @returns ID of the new customer
 */
export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const customerData = {
      ...customer,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'customers'), customerData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

/**
 * Update an existing customer
 * @param id Customer ID
 * @param customer Customer data to update
 */
export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<void> => {
  try {
    const docRef = doc(db, 'customers', id);
    const updateData = {
      ...customer,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

/**
 * Delete a customer
 * @param id Customer ID
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// Create a customerService object with all required methods
export const customerService = {
  getAll: loadCustomers,
  getByCode: getCustomerByCode,
  getById: getCustomerById,
  add: addCustomer,
  update: updateCustomer,
  delete: deleteCustomer
};
