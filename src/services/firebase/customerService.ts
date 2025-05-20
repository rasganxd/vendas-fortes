
import { Customer } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
      address: data.address || {},
      document: data.document || '',
      active: data.active !== false,
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
        address: data.address || {},
        document: data.document || '',
        active: data.active !== false,
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

// Create a customerService object to match the expected export format
export const customerService = {
  getAll: loadCustomers,
  getByCode: getCustomerByCode
};
