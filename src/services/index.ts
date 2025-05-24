
// Export all services from a single file for easier imports
export * from './local/index';

// Re-export specific services
export * from './settings/settingsService';
export { mobileSyncService } from './supabase/mobileSyncService';

// Supabase services
export { customerService } from './supabase/customerService';
export { productService } from './supabase/productService';
export { productBrandService } from './supabase/productBrandService';
export { productCategoryService } from './supabase/productCategoryService';
export { productGroupService } from './supabase/productGroupService';
export { salesRepService } from './supabase/salesRepService';
