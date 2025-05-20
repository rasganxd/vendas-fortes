
import { PaymentTable, PaymentTableTerm, PaymentTableInstallment } from '@/types';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for payment table operations using Firebase
 */
export const paymentTableService = {
  /**
   * Get all payment tables
   */
  getAll: async (): Promise<PaymentTable[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'payment_tables'));
      const tables: PaymentTable[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Get terms for this table
        const termsSnapshot = await getDocs(
          query(collection(db, 'payment_table_terms'), 
          where('payment_table_id', '==', doc.id))
        );
        const terms: PaymentTableTerm[] = [];
        termsSnapshot.forEach(termDoc => {
          const termData = termDoc.data();
          terms.push({
            id: termDoc.id,
            installment: termData.installment,
            days: termData.days,
            percentage: termData.percentage,
            description: termData.description || ''
          });
        });
        
        // Get installments for this table
        const installmentsSnapshot = await getDocs(
          query(collection(db, 'payment_table_installments'), 
          where('payment_table_id', '==', doc.id))
        );
        const installments: PaymentTableInstallment[] = [];
        installmentsSnapshot.forEach(installmentDoc => {
          const installmentData = installmentDoc.data();
          installments.push({
            id: installmentDoc.id,
            installment: installmentData.installment,
            days: installmentData.days,
            percentage: installmentData.percentage,
            description: installmentData.description || ''
          });
        });
        
        tables.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          payableTo: data.payable_to || '',
          paymentLocation: data.payment_location || '',
          type: data.type || '',
          notes: data.notes || '',
          active: data.active !== false,
          terms,
          installments,
          createdAt: data.created_at ? new Date(data.created_at.seconds * 1000) : new Date(),
          updatedAt: data.updated_at ? new Date(data.updated_at.seconds * 1000) : new Date()
        });
      }
      
      return tables;
    } catch (error) {
      console.error('Error getting payment tables:', error);
      return [];
    }
  },
  
  /**
   * Get payment table by ID
   */
  getById: async (id: string): Promise<PaymentTable | null> => {
    try {
      const docRef = doc(db, 'payment_tables', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      // Get terms for this table
      const termsSnapshot = await getDocs(
        query(collection(db, 'payment_table_terms'), 
        where('payment_table_id', '==', id))
      );
      const terms: PaymentTableTerm[] = [];
      termsSnapshot.forEach(termDoc => {
        const termData = termDoc.data();
        terms.push({
          id: termDoc.id,
          installment: termData.installment,
          days: termData.days,
          percentage: termData.percentage,
          description: termData.description || ''
        });
      });
      
      // Get installments for this table
      const installmentsSnapshot = await getDocs(
        query(collection(db, 'payment_table_installments'), 
        where('payment_table_id', '==', id))
      );
      const installments: PaymentTableInstallment[] = [];
      installmentsSnapshot.forEach(installmentDoc => {
        const installmentData = installmentDoc.data();
        installments.push({
          id: installmentDoc.id,
          installment: installmentData.installment,
          days: installmentData.days,
          percentage: installmentData.percentage,
          description: installmentData.description || ''
        });
      });
      
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description || '',
        payableTo: data.payable_to || '',
        paymentLocation: data.payment_location || '',
        type: data.type || '',
        notes: data.notes || '',
        active: data.active !== false,
        terms,
        installments,
        createdAt: data.created_at ? new Date(data.created_at.seconds * 1000) : new Date(),
        updatedAt: data.updated_at ? new Date(data.updated_at.seconds * 1000) : new Date()
      };
    } catch (error) {
      console.error('Error getting payment table by ID:', error);
      return null;
    }
  },
  
  /**
   * Add payment table
   */
  add: async (paymentTable: Omit<PaymentTable, 'id'>): Promise<string> => {
    try {
      const id = uuidv4();
      const docRef = doc(db, 'payment_tables', id);
      
      // Prepare data for Firebase
      const tableData = {
        name: paymentTable.name,
        description: paymentTable.description || '',
        payable_to: paymentTable.payableTo || '',
        payment_location: paymentTable.paymentLocation || '',
        type: paymentTable.type || '',
        notes: paymentTable.notes || '',
        active: paymentTable.active !== false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      await setDoc(docRef, tableData);
      
      // Add terms if provided
      if (paymentTable.terms && paymentTable.terms.length > 0) {
        for (const term of paymentTable.terms) {
          const termId = uuidv4();
          const termRef = doc(db, 'payment_table_terms', termId);
          
          await setDoc(termRef, {
            payment_table_id: id,
            installment: term.installment,
            days: term.days,
            percentage: term.percentage,
            description: term.description || ''
          });
        }
      }
      
      // Add installments if provided
      if (paymentTable.installments && paymentTable.installments.length > 0) {
        for (const installment of paymentTable.installments) {
          const installmentId = uuidv4();
          const installmentRef = doc(db, 'payment_table_installments', installmentId);
          
          await setDoc(installmentRef, {
            payment_table_id: id,
            installment: installment.installment,
            days: installment.days,
            percentage: installment.percentage,
            description: installment.description || ''
          });
        }
      }
      
      return id;
    } catch (error) {
      console.error('Error adding payment table:', error);
      return '';
    }
  },
  
  /**
   * Update payment table
   */
  update: async (id: string, paymentTable: Partial<PaymentTable>): Promise<void> => {
    try {
      const docRef = doc(db, 'payment_tables', id);
      
      // Prepare update data
      const updateData: Record<string, any> = { updated_at: new Date() };
      
      if (paymentTable.name !== undefined) updateData.name = paymentTable.name;
      if (paymentTable.description !== undefined) updateData.description = paymentTable.description;
      if (paymentTable.payableTo !== undefined) updateData.payable_to = paymentTable.payableTo;
      if (paymentTable.paymentLocation !== undefined) updateData.payment_location = paymentTable.paymentLocation;
      if (paymentTable.type !== undefined) updateData.type = paymentTable.type;
      if (paymentTable.notes !== undefined) updateData.notes = paymentTable.notes;
      if (paymentTable.active !== undefined) updateData.active = paymentTable.active;
      
      await updateDoc(docRef, updateData);
      
      // Update terms if provided
      if (paymentTable.terms) {
        // Delete existing terms
        const termsSnapshot = await getDocs(
          query(collection(db, 'payment_table_terms'), 
          where('payment_table_id', '==', id))
        );
        
        for (const termDoc of termsSnapshot.docs) {
          await deleteDoc(doc(db, 'payment_table_terms', termDoc.id));
        }
        
        // Add new terms
        for (const term of paymentTable.terms) {
          const termId = uuidv4();
          const termRef = doc(db, 'payment_table_terms', termId);
          
          await setDoc(termRef, {
            payment_table_id: id,
            installment: term.installment,
            days: term.days,
            percentage: term.percentage,
            description: term.description || ''
          });
        }
      }
      
      // Update installments if provided
      if (paymentTable.installments) {
        // Delete existing installments
        const installmentsSnapshot = await getDocs(
          query(collection(db, 'payment_table_installments'), 
          where('payment_table_id', '==', id))
        );
        
        for (const installmentDoc of installmentsSnapshot.docs) {
          await deleteDoc(doc(db, 'payment_table_installments', installmentDoc.id));
        }
        
        // Add new installments
        for (const installment of paymentTable.installments) {
          const installmentId = uuidv4();
          const installmentRef = doc(db, 'payment_table_installments', installmentId);
          
          await setDoc(installmentRef, {
            payment_table_id: id,
            installment: installment.installment,
            days: installment.days,
            percentage: installment.percentage,
            description: installment.description || ''
          });
        }
      }
    } catch (error) {
      console.error('Error updating payment table:', error);
      throw error;
    }
  },
  
  /**
   * Delete payment table
   */
  delete: async (id: string): Promise<void> => {
    try {
      // Delete terms for this table
      const termsSnapshot = await getDocs(
        query(collection(db, 'payment_table_terms'), 
        where('payment_table_id', '==', id))
      );
      
      for (const termDoc of termsSnapshot.docs) {
        await deleteDoc(doc(db, 'payment_table_terms', termDoc.id));
      }
      
      // Delete installments for this table
      const installmentsSnapshot = await getDocs(
        query(collection(db, 'payment_table_installments'), 
        where('payment_table_id', '==', id))
      );
      
      for (const installmentDoc of installmentsSnapshot.docs) {
        await deleteDoc(doc(db, 'payment_table_installments', installmentDoc.id));
      }
      
      // Delete the payment table
      await deleteDoc(doc(db, 'payment_tables', id));
    } catch (error) {
      console.error('Error deleting payment table:', error);
      throw error;
    }
  }
};
