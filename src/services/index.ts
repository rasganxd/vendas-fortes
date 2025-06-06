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
export { unitService } from './supabase/unitService';
export { salesRepService } from './supabase/salesRepService';
export { deliveryRouteService } from './supabase/deliveryRouteService';
export { orderService } from './supabase/orderService';
export { orderItemService } from './supabase/orderItemService';
export { paymentService } from './supabase/paymentService';
export { paymentMethodService } from './supabase/paymentMethodService';
export { paymentTableService } from './supabase/paymentTableService';
export { vehicleService } from './supabase/vehicleService';

// Sales rep authentication service
export { salesRepAuthService } from './local/salesRepAuthService';
