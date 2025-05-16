
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { v4 as uuidv4 } from 'uuid';

// Define a base interface for all Firestore entities
export interface FirestoreEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FirestoreService<T extends FirestoreEntity> {
  protected collectionName: string;
  
  constructor(entityName: string) {
    this.collectionName = entityName;
  }
  
  /**
   * Get all documents from a collection
   * @returns Array of documents
   */
  async getAll(): Promise<T[]> {
    try {
      console.log(`Fetching all documents from ${this.collectionName}`);
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to JavaScript Date objects
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as T;
      });
    } catch (error) {
      console.error(`Error retrieving ${this.collectionName} from Firestore:`, error);
      return [];
    }
  }
  
  /**
   * Get document by ID
   * @param id Document ID
   * @returns Document or null if not found
   */
  async getById(id: string): Promise<T | null> {
    try {
      console.log(`Fetching document with ID: ${id} from ${this.collectionName}`);
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore timestamps to JavaScript Date objects
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: docSnap.id } as T;
      } else {
        console.warn(`Document with ID ${id} not found in ${this.collectionName}`);
        return null;
      }
    } catch (error) {
      console.error(`Error retrieving document ${id} from ${this.collectionName}:`, error);
      return null;
    }
  }
  
  /**
   * Add a new document
   * @param entity Entity data (without ID)
   * @returns Generated ID
   */
  async add(entity: Omit<T, 'id'>): Promise<string> {
    try {
      console.log(`Adding document to ${this.collectionName}`);
      
      // Add timestamps
      const dataWithTimestamps = {
        ...entity,
        createdAt: entity.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), dataWithTimestamps);
      console.log(`Added document to ${this.collectionName} with ID:`, docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${this.collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing document
   * @param id Document ID
   * @param entity Updated entity data
   */
  async update(id: string, entity: Partial<T>): Promise<void> {
    try {
      console.log(`Updating document ${id} in ${this.collectionName}`);
      
      // Add timestamp
      const dataWithTimestamp = {
        ...entity,
        updatedAt: new Date()
      };
      
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dataWithTimestamp);
      
      console.log(`Updated document ${id} in ${this.collectionName}`);
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a document
   * @param id Document ID
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`Deleting document ${id} from ${this.collectionName}`);
      
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      console.log(`Deleted document ${id} from ${this.collectionName}`);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Query documents with filters
   * @param constraints Query constraints
   * @returns Filtered documents
   */
  async query(constraints: QueryConstraint[]): Promise<T[]> {
    try {
      console.log(`Querying ${this.collectionName} with constraints`);
      
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to JavaScript Date objects
        const convertedData = this.convertTimestamps(data);
        return { ...convertedData, id: doc.id } as T;
      });
    } catch (error) {
      console.error(`Error querying ${this.collectionName}:`, error);
      return [];
    }
  }
  
  /**
   * Helper method to convert Firestore Timestamps to JavaScript Date objects
   * Changed from private to protected to allow subclasses to use it
   */
  protected convertTimestamps(data: DocumentData): DocumentData {
    const result = { ...data };
    
    for (const [key, value] of Object.entries(result)) {
      // Convert Timestamp objects to Date objects
      if (value instanceof Timestamp) {
        result[key] = value.toDate();
      }
      // Recursively convert timestamps in nested objects
      else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.convertTimestamps(value);
      }
      // Convert timestamps in arrays of objects
      else if (Array.isArray(value)) {
        result[key] = value.map(item => {
          if (item && typeof item === 'object') {
            return this.convertTimestamps(item);
          }
          return item;
        });
      }
    }
    
    return result;
  }
}
