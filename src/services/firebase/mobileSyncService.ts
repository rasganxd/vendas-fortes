
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { SalesRep } from '@/types';
import { salesRepService } from './salesRepService';

// Define SyncLogEntry type
export interface SyncLogEntry {
  id: string;
  sales_rep_id: string;
  device_id?: string;
  event_type: 'upload' | 'download' | 'error';
  created_at: Date;
  details?: string;
  status?: string;
  _temp?: boolean;
}

// Define MobileSyncService
const SYNC_LOGS_COLLECTION = 'sync_logs';

class MobileSyncService {
  /**
   * Get sync logs for a sales rep
   * @param salesRepId ID of the sales rep
   * @returns Promise resolving to an array of sync logs
   */
  async getSyncLogs(salesRepId: string): Promise<SyncLogEntry[]> {
    try {
      const syncLogsRef = collection(db, SYNC_LOGS_COLLECTION);
      const q = query(syncLogsRef, where('sales_rep_id', '==', salesRepId));
      
      const querySnapshot = await getDocs(q);
      
      // Skip any temporary docs
      const logs: SyncLogEntry[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // Skip temporary documents used for initialization
        if (data._temp) {
          console.log("Skipping temporary sync log document:", doc.id);
          return;
        }
        
        logs.push({
          id: doc.id,
          sales_rep_id: data.sales_rep_id,
          device_id: data.device_id,
          event_type: data.event_type,
          created_at: data.created_at ? data.created_at.toDate() : new Date(),
          details: data.details,
          status: data.status
        });
      });
      
      // Sort by created_at descending
      return logs.sort((a, b) => {
        const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
        const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting sync logs:', error);
      throw error;
    }
  }
  
  /**
   * Add a sync log entry
   * @param syncLog Sync log entry to add
   * @returns Promise resolving to the ID of the new sync log
   */
  async addSyncLog(syncLog: Omit<SyncLogEntry, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, SYNC_LOGS_COLLECTION), {
        ...syncLog,
        created_at: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding sync log:', error);
      throw error;
    }
  }
  
  /**
   * Clear all sync logs for a sales rep
   * @param salesRepId ID of the sales rep
   */
  async clearSyncLogs(salesRepId: string): Promise<void> {
    try {
      const syncLogsRef = collection(db, SYNC_LOGS_COLLECTION);
      const q = query(syncLogsRef, where('sales_rep_id', '==', salesRepId));
      
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleared ${querySnapshot.size} sync logs for sales rep ${salesRepId}`);
    } catch (error) {
      console.error('Error clearing sync logs:', error);
      throw error;
    }
  }
  
  /**
   * Get all sales reps
   * @returns Promise resolving to an array of sales reps
   */
  async getAllSalesReps(): Promise<SalesRep[]> {
    try {
      return await salesRepService.getAll();
    } catch (error) {
      console.error('Error getting all sales reps:', error);
      throw error;
    }
  }
  
  /**
   * Sync data for a sales rep
   * @param salesRepId ID of the sales rep
   * @returns Promise resolving to the sales rep object if successful
   */
  async syncSalesRepById(salesRepId: string): Promise<SalesRep | null> {
    try {
      const salesRep = await salesRepService.getById(salesRepId);
      
      if (!salesRep) {
        console.error(`Sales rep with ID ${salesRepId} not found`);
        return null;
      }
      
      // Log the sync event
      await this.addSyncLog({
        sales_rep_id: salesRepId,
        event_type: 'download',
        created_at: new Date(),
        details: 'Sync initiated from admin panel',
        status: 'success'
      });
      
      return salesRep;
    } catch (error) {
      console.error(`Error syncing sales rep ${salesRepId}:`, error);
      
      // Log the error
      try {
        await this.addSyncLog({
          sales_rep_id: salesRepId,
          event_type: 'error',
          created_at: new Date(),
          details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: 'failed'
        });
      } catch (logError) {
        console.error('Error logging sync error:', logError);
      }
      
      throw error;
    }
  }
}

export const mobileSyncService = new MobileSyncService();
