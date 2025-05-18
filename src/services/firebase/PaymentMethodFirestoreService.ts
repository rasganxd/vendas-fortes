
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { PaymentMethod } from '@/types';

class PaymentMethodFirestoreService {
  private collection = 'paymentMethods';

  async getAll(): Promise<PaymentMethod[]> {
    const querySnapshot = await getDocs(collection(db, this.collection));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentMethod));
  }

  async getById(id: string): Promise<PaymentMethod | null> {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PaymentMethod;
    }
    return null;
  }

  async add(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), paymentMethod);
    return docRef.id;
  }

  async update(id: string, paymentMethod: Partial<PaymentMethod>): Promise<boolean> {
    const docRef = doc(db, this.collection, id);
    await updateDoc(docRef, paymentMethod);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const docRef = doc(db, this.collection, id);
    await deleteDoc(docRef);
    return true;
  }
}

export default PaymentMethodFirestoreService;
