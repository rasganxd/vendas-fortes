
import { Load } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * Load-specific Firestore service implementation
 */
class LoadFirestoreServiceClass extends FirestoreService<Load> {
  constructor() {
    super('loads');
  }

  /**
   * Get load by code
   * @param code Load code
   * @returns Load or null if not found
   */
  async getByCode(code: number): Promise<Load | null> {
    try {
      console.log(`LoadFirestoreService: Getting load by code ${code}`);
      const loads = await this.query([where('code', '==', code)]);
      
      if (loads.length > 0) {
        console.log(`LoadFirestoreService: Found load with code ${code}`);
        return loads[0];
      } else {
        console.log(`LoadFirestoreService: No load found with code ${code}`);
        return null;
      }
    } catch (error) {
      console.error(`LoadFirestoreService: Error getting load by code ${code}:`, error);
      return null;
    }
  }

  /**
   * Get highest code currently used
   * @returns Highest code number
   */
  async getHighestCode(): Promise<number> {
    const loads = await this.getAll();
    
    if (loads.length === 0) return 0;
    
    return loads.reduce(
      (max, load) => (load.code > max ? load.code : max), 
      0
    );
  }
}

// Create a singleton instance
export const loadFirestoreService = new LoadFirestoreServiceClass();
