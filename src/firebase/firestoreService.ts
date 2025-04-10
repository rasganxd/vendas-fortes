import { firestore } from './firebaseConfig';
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Customer, SalesRep, Product, Order, PaymentTable } from '@/types';

// Generic function to convert Firestore Timestamp to JavaScript Date
const convertTimestampToDate = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];

      if (value instanceof Timestamp) {
        data[key] = value.toDate();
      } else if (typeof value === 'object') {
        convertTimestampToDate(value);
      }
    }
  }

  return data;
};

// Generic service functions
const createService = <T extends { id?: string }>(collectionName: string) => {
  return {
    getAll: async (): Promise<T[]> => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(firestore, collectionName));
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...convertTimestampToDate(data),
            id: doc.id
          } as T;
        });
      } catch (error) {
        console.error(`Erro ao buscar todos os documentos de ${collectionName}:`, error);
        throw error;
      }
    },

    add: async (item: Omit<T, 'id'>): Promise<string> => {
      try {
        const docRef = await addDoc(collection(firestore, collectionName), item);
        return docRef.id;
      } catch (error) {
        console.error(`Erro ao adicionar documento em ${collectionName}:`, error);
        throw error;
      }
    },

    getById: async (id: string): Promise<T | null> => {
      try {
        const docRef = doc(firestore, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return {
            ...convertTimestampToDate(docSnap.data()),
            id: docSnap.id
          } as T;
        } else {
          console.log("Documento não encontrado!");
          return null;
        }
      } catch (error) {
        console.error(`Erro ao buscar documento com ID ${id} em ${collectionName}:`, error);
        throw error;
      }
    },

    update: async (id: string, item: Partial<T>): Promise<void> => {
      try {
        const docRef = doc(firestore, collectionName, id);
        await updateDoc(docRef, item);
      } catch (error) {
        console.error(`Erro ao atualizar documento com ID ${id} em ${collectionName}:`, error);
        throw error;
      }
    },

    delete: async (id: string): Promise<void> => {
      try {
        const docRef = doc(firestore, collectionName, id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error(`Erro ao deletar documento com ID ${id} em ${collectionName}:`, error);
        throw error;
      }
    },
  };
};

// Specific service instances
export const customerService = createService<Customer>('customers');
export const salesRepService = createService<SalesRep>('salesReps');
export const productService = createService<Product>('products');
export const paymentTableService = createService<PaymentTable>('paymentTables');

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    try {
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(firestore, 'orders'));
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Order, 'id'>;
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt)
        } as Order;
      });
    } catch (error) {
      console.error("Erro ao buscar todos os pedidos:", error);
      return [];
    }
  },

  add: async (order: Omit<Order, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(firestore, 'orders'), order);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar pedido:", error);
      return "";
    }
  },
  
  getById: async (id: string): Promise<Order | null> => {
    try {
      const orderRef = doc(firestore, 'orders', id);
      const orderSnap = await getDocs(collection(firestore, 'orders'));
      const orderDoc = orderSnap.docs.find(doc => doc.id === id);
      
      if (orderDoc) {
        const data = orderDoc.data() as Omit<Order, 'id'>;
        return { 
          ...data, 
          id: orderDoc.id,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt)
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting order by ID:", error);
      return null;
    }
  },

  update: async (id: string, order: Partial<Order>): Promise<void> => {
    try {
      const orderRef = doc(firestore, 'orders', id);
      await updateDoc(orderRef, order);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const orderRef = doc(firestore, 'orders', id);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
    }
  },
};
