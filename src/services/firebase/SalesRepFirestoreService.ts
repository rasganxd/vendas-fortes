
import { SalesRep } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * SalesRep-specific Firestore service implementation
 */
class SalesRepFirestoreServiceClass extends FirestoreService<SalesRep> {
  constructor() {
    super('sales_reps');
  }

  /**
   * Get sales rep by code
   * @param code Sales rep code
   * @returns SalesRep or null if not found
   */
  async getByCode(code: number): Promise<SalesRep | null> {
    try {
      console.log(`SalesRepFirestoreService: Getting sales rep by code ${code}`);
      const salesReps = await this.query([where('code', '==', code)]);
      
      if (salesReps.length > 0) {
        console.log(`SalesRepFirestoreService: Found sales rep with code ${code}`);
        return salesReps[0];
      } else {
        console.log(`SalesRepFirestoreService: No sales rep found with code ${code}`);
        return null;
      }
    } catch (error) {
      console.error(`SalesRepFirestoreService: Error getting sales rep by code ${code}:`, error);
      return null;
    }
  }

  /**
   * Get active sales reps
   * @returns Array of active sales reps
   */
  async getActive(): Promise<SalesRep[]> {
    try {
      console.log("SalesRepFirestoreService: Getting active sales reps");
      const salesReps = await this.query([where('active', '==', true)]);
      console.log(`SalesRepFirestoreService: Found ${salesReps.length} active sales reps`);
      return salesReps;
    } catch (error) {
      console.error("SalesRepFirestoreService: Error getting active sales reps:", error);
      return [];
    }
  }

  /**
   * Generate next available sales rep code
   * @returns Next available code
   */
  async generateNextCode(): Promise<number> {
    try {
      console.log("SalesRepFirestoreService: Generating next sales rep code");
      const salesReps = await this.getAll();
      
      if (salesReps.length === 0) {
        console.log("SalesRepFirestoreService: No sales reps found, returning code 1");
        return 1;
      }
      
      const highestCode = salesReps.reduce(
        (max, rep) => (rep.code > max ? rep.code : max),
        0
      );
      
      const nextCode = highestCode + 1;
      console.log(`SalesRepFirestoreService: Generated next sales rep code: ${nextCode}`);
      return nextCode;
    } catch (error) {
      console.error("SalesRepFirestoreService: Error generating next sales rep code:", error);
      return 1;
    }
  }
}

// Create a singleton instance
export const salesRepFirestoreService = new SalesRepFirestoreServiceClass();
