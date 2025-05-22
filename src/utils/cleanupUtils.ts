
import { productCategoryService } from '@/services/firebase/productCategoryService';
import { productGroupService } from '@/services/firebase/productGroupService';
import { productBrandService } from '@/services/firebase/productBrandService';

/**
 * Utility functions to clean up duplicate data in the database
 */
export const cleanupUtils = {
  /**
   * Clean up all duplicate product classifications (categories, groups, brands)
   */
  cleanupAllProductClassifications: async (): Promise<void> => {
    console.log('Starting cleanup of all product classifications');
    try {
      // Clean up duplicate categories
      await productCategoryService.cleanupDuplicates();
      
      // Clean up duplicate groups
      await productGroupService.cleanupDuplicates();
      
      // Clean up duplicate brands
      await productBrandService.cleanupDuplicates();
      
      console.log('Finished cleaning up all product classifications');
    } catch (error) {
      console.error('Error cleaning up product classifications:', error);
      throw error;
    }
  }
};
