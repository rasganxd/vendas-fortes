
// Export all services from a single file for easier imports
export * from './local/index';

// Re-export specific services
export * from './settings/settingsService';

// Supabase services
export { customerService } from './supabase/customerService';
export { productService } from './supabase/productService';
export { productBrandService } from './supabase/productBrandService';
export { productCategoryService } from './supabase/productCategoryService';
export { productGroupService } from './supabase/productGroupService';
export { salesRepService } from './supabase/salesRepService';
export { mobileSyncService } from './supabase/mobileSyncService';
export { deliveryRouteService } from './supabase/deliveryRouteService';
export { loadService } from './supabase/loadService';
export { orderService } from './supabase/orderService';
export { paymentService } from './supabase/paymentService';
export { paymentMethodService } from './supabase/paymentMethodService';
export { paymentTableService } from './supabase/paymentTableService';
export { vehicleService } from './supabase/vehicleService';
