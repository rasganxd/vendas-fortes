
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './config';
import { SalesRep } from '@/types';
import { salesRepFirestoreService } from './SalesRepFirestoreService';

/**
 * Definition of the SyncLogEntry type
 */
export interface SyncLogEntry {
  id: string;
  event_type: 'upload' | 'download' | 'error';
  device_id: string;
  sales_rep_id: string;
  created_at: Date;
  details?: any;
}

/**
 * Mobile Sync Service using Firebase
 */
export const mobileSyncService = {
  /**
   * Get all sales reps
   * @returns Array of SalesRep
   */
  getAllSalesReps: async (): Promise<SalesRep[]> => {
    try {
      return await salesRepFirestoreService.getAll();
    } catch (error) {
      console.error("Error in getAllSalesReps:", error);
      return [];
    }
  },

  /**
   * Sync a sales rep by ID
   * @param id - Sales rep ID
   * @returns SalesRep
   */
  syncSalesRepById: async (id: string): Promise<SalesRep | null> => {
    try {
      return await salesRepFirestoreService.getById(id);
    } catch (error) {
      console.error("Error in syncSalesRepById:", error);
      return null;
    }
  },

  /**
   * Sync multiple sales reps
   * @param salesReps - Array of SalesRep
   * @returns Promise<void>
   */
  syncSalesReps: async (salesReps: SalesRep[]): Promise<void> => {
    try {
      // This would typically use a batch update, but for simplicity we'll just loop
      for (const salesRep of salesReps) {
        if (salesRep.id) {
          await salesRepFirestoreService.update(salesRep.id, salesRep);
        } else {
          await salesRepFirestoreService.add(salesRep);
        }
      }
    } catch (error) {
      console.error("Error in syncSalesReps:", error);
    }
  },

  /**
   * Get sync logs for a sales rep
   * @param salesRepId - Sales rep ID
   * @returns Array of SyncLogEntry
   */
  getSyncLogs: async (salesRepId: string): Promise<SyncLogEntry[]> => {
    try {
      const q = query(
        collection(db, 'sync_logs'),
        where('sales_rep_id', '==', salesRepId),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const logs: SyncLogEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          event_type: data.event_type,
          device_id: data.device_id,
          sales_rep_id: data.sales_rep_id,
          created_at: data.created_at.toDate(),
          details: data.details || {}
        });
      });
      
      return logs;
    } catch (error) {
      console.error("Error in getSyncLogs:", error);
      return [];
    }
  },
  
  /**
   * Log a sync event
   * @param eventType - Type of event (upload, download, error)
   * @param deviceId - Device ID
   * @param salesRepId - Sales rep ID
   * @param details - Additional details
   * @returns Promise<string> - ID of the created log entry
   */
  logSyncEvent: async (
    eventType: 'upload' | 'download' | 'error',
    deviceId: string,
    salesRepId: string,
    details?: any
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'sync_logs'), {
        event_type: eventType,
        device_id: deviceId,
        sales_rep_id: salesRepId,
        created_at: new Date(),
        details: details || {}
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error in logSyncEvent:", error);
      return '';
    }
  }
};
