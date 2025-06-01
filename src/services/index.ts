// Export all services from a single file for easier imports
export * from './local/index';

// Re-export specific services
export * from './settings/settingsService';

// Supabase services
export { customerService } from './supabase/customerService';
export { productService } from './supabase/productService';
export { productDependenciesService } from './supabase/productDependenciesService';
export { productBrandService } from './supabase/productBrandService';
export { productCategoryService } from './supabase/productCategoryService';
export { productGroupService } from './supabase/productGroupService';
export { salesRepService } from './supabase/salesRepService';
export { mobileSyncService } from './supabase/mobileSyncService';
export { deliveryRouteService } from './supabase/deliveryRouteService';
export { loadService } from './supabase/loadService';
export { orderService } from './supabase/orderService';
export { orderItemService } from './supabase/orderItemService';
export { paymentService } from './supabase/paymentService';
export { paymentMethodService } from './supabase/paymentMethodService';
export { paymentTableService } from './supabase/paymentTableService';
export { vehicleService } from './supabase/vehicleService';
export { apiTokenService } from './supabase/apiTokenService';
export { mobileOrderImportService } from './supabase/mobileOrderImportService';
export { mobileOrderService } from './supabase/mobileOrderService';
export { productUnitsService } from './supabase/productUnitsService';
export { productUnitsMappingService } from './supabase/productUnitsMapping';
export { unitUsageService } from './supabase/unitUsageService';
export { productDiscountService } from './supabase/productDiscountService';
