
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp
} from "firebase/firestore";
import { db } from "./config";
import { 
  Customer, 
  Product, 
  Order, 
  Payment, 
  DeliveryRoute, 
  Load, 
  SalesRep, 
  Vehicle 
} from "@/types";

// Converte timestamp do Firestore para Date
const convertTimestampToDate = (data: any) => {
  const newData = { ...data };
  
  // Verifica se há timestamps e converte para Date
  Object.keys(newData).forEach(key => {
    if (newData[key] instanceof Timestamp) {
      newData[key] = newData[key].toDate();
    }
  });
  
  return newData;
};

// Serviço para Customers
export const customerService = {
  async getAll(): Promise<Customer[]> {
    const customersRef = collection(db, "customers");
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Customer));
  },
  
  async add(customer: Omit<Customer, "id">): Promise<string> {
    const customerData = {
      ...customer,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "customers"), customerData);
    return docRef.id;
  },
  
  async update(id: string, customer: Partial<Customer>): Promise<void> {
    const customerRef = doc(db, "customers", id);
    await updateDoc(customerRef, customer);
  },
  
  async delete(id: string): Promise<void> {
    const customerRef = doc(db, "customers", id);
    await deleteDoc(customerRef);
  }
};

// Serviço para Products
export const productService = {
  async getAll(): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Product));
  },
  
  async add(product: Omit<Product, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "products"), product);
    return docRef.id;
  },
  
  async update(id: string, product: Partial<Product>): Promise<void> {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, product);
  },
  
  async delete(id: string): Promise<void> {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  }
};

// Serviço para Orders
export const orderService = {
  async getAll(): Promise<Order[]> {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Order));
  },
  
  async add(order: Omit<Order, "id">): Promise<string> {
    const orderData = {
      ...order,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "orders"), orderData);
    return docRef.id;
  },
  
  async update(id: string, order: Partial<Order>): Promise<void> {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, order);
  },
  
  async delete(id: string): Promise<void> {
    const orderRef = doc(db, "orders", id);
    await deleteDoc(orderRef);
  }
};

// Você pode adicionar serviços semelhantes para os outros tipos (Payment, DeliveryRoute, etc.)
// seguindo o mesmo padrão
