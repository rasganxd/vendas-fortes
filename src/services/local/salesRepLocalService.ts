
import { SalesRep } from '@/types';
import { LocalStorageService } from './localStorageService';
import { mockSalesReps } from '@/data/mock/salesReps';

/**
 * LocalStorage service for sales representatives
 */
class SalesRepLocalService extends LocalStorageService<SalesRep> {
  constructor() {
    super('sales_reps');
    this.initializeWithMockData();
  }
  
  /**
   * Initialize with mock data if empty
   */
  async initializeWithMockData(): Promise<void> {
    const data = await this.getAll();
    
    if (data.length === 0) {
      console.log("Initializing sales reps local storage with mock data");
      await this.initializeWithDefault(mockSalesReps);
    }
  }
  
  /**
   * Get sales rep by code
   * @param code Sales rep code
   * @returns SalesRep or null if not found
   */
  async getByCode(code: number): Promise<SalesRep | null> {
    try {
      const salesReps = await this.getAll();
      return salesReps.find(rep => rep.code === code) || null;
    } catch (error) {
      console.error(`Error retrieving sales rep by code ${code}:`, error);
      return null;
    }
  }
  
  /**
   * Get highest code currently used
   * @returns Highest code number
   */
  async getHighestCode(): Promise<number> {
    const salesReps = await this.getAll();
    
    if (salesReps.length === 0) return 0;
    
    return salesReps.reduce(
      (max, rep) => (rep.code > max ? rep.code : max), 
      0
    );
  }
}

// Create a singleton instance
export const salesRepLocalService = new SalesRepLocalService();
